/**
 * @module utils/googleOAuth
 * @description Raw Google OAuth 2.0 PKCE authentication utilities with zero third-party passport dependencies.
 */
import crypto from 'node:crypto';
import { env } from '../config/env.js';

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';
const OAUTH_SCOPES = 'openid email profile https://www.googleapis.com/auth/drive.file';

/**
 * Generates a Google OAuth 2.0 authorization URL with PKCE S256 code challenge and cryptographic state.
 * @function generateGoogleAuthUrl
 * @param {string} [redirectUri] - Optional override redirect URI.
 * @returns {{ url: string, state: string, codeVerifier: string }}
 */
export const generateGoogleAuthUrl = (redirectUri) => {
  const codeVerifier = crypto.randomBytes(64).toString('hex');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  const state = crypto.randomBytes(32).toString('hex');

  const resolvedRedirectUri = redirectUri || env.GOOGLE_REDIRECT_URI;

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: resolvedRedirectUri,
    response_type: 'code',
    scope: OAUTH_SCOPES,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return {
    url: `${GOOGLE_AUTH_BASE}?${params.toString()}`,
    state,
    codeVerifier,
  };
};

/**
 * Exchanges an authorization code and PKCE code verifier for Google tokens.
 * @function exchangeGoogleCode
 * @param {string} code - Authorization code from Google.
 * @param {string} codeVerifier - PKCE code verifier generated during initiation.
 * @param {string} [redirectUri] - Optional override redirect URI.
 * @returns {Promise<object>} Token response object containing access_token, id_token, etc.
 */
export const exchangeGoogleCode = async (code, codeVerifier, redirectUri) => {
  const resolvedRedirectUri = redirectUri || env.GOOGLE_REDIRECT_URI;

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: codeVerifier,
      grant_type: 'authorization_code',
      redirect_uri: resolvedRedirectUri,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Google token exchange failed (${response.status}): ${errorBody}`);
  }

  return response.json();
};

/**
 * Retrieves the Google user profile info using the Google access token.
 * @function getGoogleUserInfo
 * @param {string} accessToken - Google access token.
 * @returns {Promise<{ sub: string, email: string, name?: string, picture?: string }>} Google user profile.
 */
export const getGoogleUserInfo = async (accessToken) => {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to retrieve Google userinfo (${response.status}): ${errorBody}`);
  }

  return response.json();
};
