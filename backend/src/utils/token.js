/**
 * @module utils/token
 * @description JWT generation, cryptographic token hashing, and dual httpOnly cookie management.
 */
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { COOKIE_PATHS, TOKEN_EXPIRIES } from './constants.js';

/**
 * Generates a signed 15-minute access token for the authenticated supervisor.
 * @function generateAccessToken
 * @param {object} user - User document or user object with _id and email.
 * @returns {string} Signed JWT access token.
 */
export const generateAccessToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    email: user.email,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN || TOKEN_EXPIRIES.ACCESS_EXPIRY_STRING,
  });
};

/**
 * Generates a cryptographically secure 64-byte random hex string for the refresh token.
 * @function generateRefreshToken
 * @returns {string} Raw refresh token hex string.
 */
export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

/**
 * Generates a cryptographically random UUIDv4 token family identifier.
 * @function generateTokenFamily
 * @returns {string} UUIDv4 string.
 */
export const generateTokenFamily = () => {
  return crypto.randomUUID();
};

/**
 * Computes the SHA-256 hex digest of a raw token string for secure persistence.
 * @function hashToken
 * @param {string} rawToken - Raw token string.
 * @returns {string} SHA-256 hex digest.
 */
export const hashToken = (rawToken) => {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

/**
 * Sets dual httpOnly cookies on the HTTP response.
 * @function setAuthCookies
 * @param {import('express').Response} res - Express response object.
 * @param {string} accessToken - Raw JWT access token string.
 * @param {string} refreshToken - Raw refresh token string.
 */
export const setAuthCookies = (res, accessToken, refreshToken) => {
  const isProduction = env.NODE_ENV === 'production';

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: COOKIE_PATHS.ACCESS_TOKEN,
    maxAge: TOKEN_EXPIRIES.ACCESS_MAX_AGE_MS,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: COOKIE_PATHS.REFRESH_TOKEN,
    maxAge: TOKEN_EXPIRIES.REFRESH_MAX_AGE_MS,
  });
};

/**
 * Clears dual httpOnly auth cookies on the HTTP response.
 * @function clearAuthCookies
 * @param {import('express').Response} res - Express response object.
 */
export const clearAuthCookies = (res) => {
  const isProduction = env.NODE_ENV === 'production';

  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: COOKIE_PATHS.ACCESS_TOKEN,
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: COOKIE_PATHS.REFRESH_TOKEN,
  });
};

/**
 * Verifies an access token signature and returns the decoded payload.
 * @function verifyAccessToken
 * @param {string} token - JWT access token string.
 * @returns {object} Decoded token payload.
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};
