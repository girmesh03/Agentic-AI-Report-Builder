/**
 * @module controllers/authController
 * @description HTTP controllers for authentication lifecycle endpoints.
 */
import path from 'node:path';
import fs from 'node:fs';
import asyncHandler from 'express-async-handler';
import * as authService from '../services/authService.js';
import { setAuthCookies, clearAuthCookies } from '../utils/token.js';
import { HTTP_STATUS } from '../config/httpStatus.js';

/**
 * Handles supervisor registration.
 * @function registerHandler
 */
export const registerHandler = asyncHandler(async (req, res) => {
  await authService.register({
    email: req.validated.body.email,
    password: req.validated.body.password,
  });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Registration successful. Please log in.',
    data: null,
  });
});

/**
 * Handles supervisor email/password authentication and cookie issuance.
 * @function loginHandler
 */
export const loginHandler = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login({
    email: req.validated.body.email,
    password: req.validated.body.password,
  });

  setAuthCookies(res, accessToken, refreshToken);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Login successful',
    data: { user },
  });
});

/**
 * Handles token family rotation via httpOnly refresh cookie.
 * @function refreshHandler
 */
export const refreshHandler = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refresh(incomingRefreshToken);

  setAuthCookies(res, accessToken, refreshToken);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Tokens refreshed successfully',
    data: { user },
  });
});

/**
 * Handles supervisor logout and session invalidation.
 * @function logoutHandler
 */
export const logoutHandler = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;
  await authService.logout(incomingRefreshToken);

  clearAuthCookies(res);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});

/**
 * Generates raw Google OAuth 2.0 PKCE initiation URL.
 * @function googleAuthUrlHandler
 */
export const googleAuthUrlHandler = asyncHandler(async (req, res) => {
  const redirectUri = req.query?.redirectUri;
  const authData = authService.getGoogleOAuthUrl(redirectUri);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Google authorization URL generated',
    data: authData,
  });
});

/**
 * Exchanges authorization code and PKCE verifier for Google session.
 * @function googleCallbackHandler
 */
export const googleCallbackHandler = asyncHandler(async (req, res) => {
  const { code, codeVerifier } = req.validated.body;
  const redirectUri = req.body?.redirectUri;

  const { user, accessToken, refreshToken } = await authService.handleGoogleOAuthCallback({
    code,
    codeVerifier,
    redirectUri,
  });

  setAuthCookies(res, accessToken, refreshToken);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Authenticated successfully with Google',
    data: { user },
  });
});

/**
 * Streams the active user's avatar image or generates an SVG initials badge fallback.
 * @function avatarStreamHandler
 */
export const avatarStreamHandler = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.avatar) {
    const fullPath = path.resolve(process.cwd(), user.avatar);
    if (fs.existsSync(fullPath)) {
      return res.sendFile(fullPath);
    }
  }

  // Fallback: Generate SVG placeholder with initials
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 'U';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
    <rect width="128" height="128" rx="64" fill="#0288d1" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-family="'Segoe UI', Roboto, sans-serif" font-size="48" font-weight="600" fill="#ffffff">${initials}</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.status(HTTP_STATUS.OK).send(svg);
});
