/**
 * @module services/authService
 * @description Authentication service implementing registration, credentials login,
 * token family rotation, theft detection, and raw Google OAuth 2.0 PKCE.
 */
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenFamily,
  hashToken,
} from '../utils/token.js';
import {
  generateGoogleAuthUrl,
  exchangeGoogleCode,
  getGoogleUserInfo,
} from '../utils/googleOAuth.js';
import { ConflictError, UnauthorizedError } from '../errors/index.js';

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Registers a new supervisor account with email and password.
 * @function register
 * @param {object} params - Registration arguments.
 * @param {string} params.email - User email.
 * @param {string} params.password - Plain text password.
 * @returns {Promise<object>} Created user document (without password).
 */
export const register = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  const prefix = normalizedEmail.split('@')[0];

  const user = await User.create({
    email: normalizedEmail,
    password,
    firstName: prefix,
    lastName: prefix,
    position: 'Area Supervisor',
  });

  return user.toObject();
};

/**
 * Authenticates user credentials with anti-enumeration protection and issues a new token family session.
 * @function login
 * @param {object} params - Login credentials.
 * @param {string} params.email - User email.
 * @param {string} params.password - Plain text password.
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
export const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const rawAccessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);
  const family = generateTokenFamily();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    family,
    expiresAt,
  });

  return {
    user: user.toObject(),
    accessToken: rawAccessToken,
    refreshToken: rawRefreshToken,
  };
};

/**
 * Rotates refresh token within an atomic transaction and executes theft detection if a revoked token is reused.
 * @function refresh
 * @param {string} incomingRefreshToken - Raw refresh token from cookie.
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
export const refresh = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) {
    throw new UnauthorizedError('Refresh token is required');
  }

  const incomingHash = hashToken(incomingRefreshToken);
  const tokenDoc = await RefreshToken.findOne({ tokenHash: incomingHash });

  if (!tokenDoc) {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Reuse Detection: If an already-revoked refresh token is presented, invalidate entire token family!
  if (tokenDoc.isRevoked) {
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await RefreshToken.updateMany(
          { family: tokenDoc.family },
          { isRevoked: true },
          { session }
        );
      });
    } finally {
      session.endSession();
    }
    throw new UnauthorizedError('Session invalidated due to suspicious activity. Please log in again.');
  }

  if (tokenDoc.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token expired. Please log in again.');
  }

  const user = await User.findById(tokenDoc.user);
  if (!user) {
    throw new UnauthorizedError('User account not found');
  }

  const newRawAccessToken = generateAccessToken(user);
  const newRawRefreshToken = generateRefreshToken();
  const newTokenHash = hashToken(newRawRefreshToken);
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      tokenDoc.isRevoked = true;
      await tokenDoc.save({ session });

      await RefreshToken.create(
        [
          {
            user: user._id,
            tokenHash: newTokenHash,
            family: tokenDoc.family,
            expiresAt: newExpiresAt,
          },
        ],
        { session }
      );
    });
  } finally {
    session.endSession();
  }

  return {
    user: user.toObject(),
    accessToken: newRawAccessToken,
    refreshToken: newRawRefreshToken,
  };
};

/**
 * Invalidates the specific refresh token session upon logout.
 * @function logout
 * @param {string} [incomingRefreshToken] - Raw refresh token from cookie.
 * @returns {Promise<void>}
 */
export const logout = async (incomingRefreshToken) => {
  if (!incomingRefreshToken) return;

  const incomingHash = hashToken(incomingRefreshToken);
  await RefreshToken.updateOne(
    { tokenHash: incomingHash },
    { isRevoked: true }
  );
};

/**
 * Generates Google OAuth authorization URL.
 * @function getGoogleOAuthUrl
 * @param {string} [redirectUri] - Optional redirect URI.
 * @returns {{ url: string, state: string, codeVerifier: string }}
 */
export const getGoogleOAuthUrl = (redirectUri) => {
  return generateGoogleAuthUrl(redirectUri);
};

/**
 * Handles Google OAuth callback and returns authenticated session.
 * @function handleGoogleOAuthCallback
 * @param {object} params
 * @param {string} params.code - Authorization code.
 * @param {string} params.codeVerifier - PKCE code verifier.
 * @param {string} [params.redirectUri] - Optional redirect URI.
 * @returns {Promise<{ user: object, accessToken: string, refreshToken: string }>}
 */
export const handleGoogleOAuthCallback = async ({ code, codeVerifier, redirectUri }) => {
  const tokenData = await exchangeGoogleCode(code, codeVerifier, redirectUri);
  const googleProfile = await getGoogleUserInfo(tokenData.access_token);

  if (!googleProfile?.email) {
    throw new UnauthorizedError('Failed to obtain verified email from Google profile');
  }

  const normalizedEmail = googleProfile.email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const prefix = normalizedEmail.split('@')[0];
    let firstName = prefix;
    let lastName = prefix;

    if (googleProfile.name) {
      const nameParts = googleProfile.name.trim().split(/\s+/);
      firstName = nameParts[0] || prefix;
      lastName = nameParts.slice(1).join(' ') || prefix;
    }

    user = await User.create({
      email: normalizedEmail,
      firstName,
      lastName,
      googleId: googleProfile.sub,
      position: 'Area Supervisor',
    });
  } else if (!user.googleId) {
    user.googleId = googleProfile.sub;
    await user.save();
  }

  const rawAccessToken = generateAccessToken(user);
  const rawRefreshToken = generateRefreshToken();
  const tokenHash = hashToken(rawRefreshToken);
  const family = generateTokenFamily();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    family,
    expiresAt,
  });

  return {
    user: user.toObject(),
    accessToken: rawAccessToken,
    refreshToken: rawRefreshToken,
  };
};
