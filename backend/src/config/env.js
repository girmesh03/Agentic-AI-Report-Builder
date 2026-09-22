/**
 * @module config/env
 * @description Centralized, immutable backend environment configuration.
 */
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config();

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
const addisApiKey = process.env.ADDIS_AI_API_KEY || process.env.ADDIS_API_KEY;
const allowedOriginsRaw = process.env.ALLOWED_ORIGINS || process.env.CLIENT_ORIGIN || 'http://localhost:3000';

const requiredEnvVars = [
  { key: 'MONGODB_URI / MONGO_URI', value: mongoUri },
  { key: 'JWT_ACCESS_SECRET', value: process.env.JWT_ACCESS_SECRET },
  { key: 'JWT_REFRESH_SECRET', value: process.env.JWT_REFRESH_SECRET },
  { key: 'ADDIS_AI_API_KEY / ADDIS_API_KEY', value: addisApiKey },
  { key: 'GEMINI_API_KEY', value: process.env.GEMINI_API_KEY },
];

const missing = requiredEnvVars.filter((item) => !item.value).map((item) => item.key);
if (missing.length > 0) {
  throw new Error(`CRITICAL CONFIGURATION ERROR: Missing required environment variables: ${missing.join(', ')}`);
}

/**
 * @typedef {object} BackendEnv
 * @property {string} NODE_ENV - Active runtime environment ('development' | 'production' | 'test').
 * @property {number} PORT - TCP port for HTTP server binding.
 * @property {string} MONGODB_URI - Primary MongoDB connection URI.
 * @property {string} JWT_ACCESS_SECRET - Cryptographic secret for signing access tokens.
 * @property {string} JWT_REFRESH_SECRET - Cryptographic secret for signing refresh tokens.
 * @property {string} JWT_ACCESS_EXPIRES_IN - Access token expiration lifespan.
 * @property {string} JWT_REFRESH_EXPIRES_IN - Refresh token expiration lifespan.
 * @property {string} ADDIS_AI_API_KEY - API token for Addis AI STT SDK.
 * @property {string} GEMINI_API_KEY - API token for Google Gemini AI runtime.
 * @property {string} NVIDIA_API_KEY - API token for Tier 3 Nvidia NIM fallback.
 * @property {string} GOOGLE_CLIENT_ID - OAuth 2.0 Client ID for Google login and Drive export.
 * @property {string} GOOGLE_CLIENT_SECRET - OAuth 2.0 Client Secret.
 * @property {string} GOOGLE_REDIRECT_URI - OAuth 2.0 authorized callback URI.
 * @property {readonly string[]} ALLOWED_ORIGINS - Array of permitted CORS origin strings.
 * @property {number} AI_TIMEOUT_MS - Bound timeout in ms for external AI invocations.
 * @property {string} LOG_LEVEL - Winston logging verbosity threshold.
 */

/**
 * Deeply frozen backend environment configuration object.
 * @type {Readonly<BackendEnv>}
 */
export const env = Object.freeze({
  NODE_ENV: Object.freeze(process.env.NODE_ENV || 'development'),
  PORT: Object.freeze(parseInt(process.env.PORT || '4000', 10)),
  MONGODB_URI: Object.freeze(mongoUri),
  JWT_ACCESS_SECRET: Object.freeze(process.env.JWT_ACCESS_SECRET),
  JWT_REFRESH_SECRET: Object.freeze(process.env.JWT_REFRESH_SECRET),
  JWT_ACCESS_EXPIRES_IN: Object.freeze(process.env.JWT_ACCESS_EXPIRES_IN || '15m'),
  JWT_REFRESH_EXPIRES_IN: Object.freeze(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
  ADDIS_AI_API_KEY: Object.freeze(addisApiKey),
  GEMINI_API_KEY: Object.freeze(process.env.GEMINI_API_KEY),
  NVIDIA_API_KEY: Object.freeze(process.env.NVIDIA_API_KEY || ''),
  GOOGLE_CLIENT_ID: Object.freeze(process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_GOOGLE_CLIENT_ID || ''),
  GOOGLE_CLIENT_SECRET: Object.freeze(process.env.GOOGLE_CLIENT_SECRET || process.env.OAUTH_GOOGLE_CLIENT_SECRET || ''),
  GOOGLE_REDIRECT_URI: Object.freeze(process.env.GOOGLE_REDIRECT_URI || process.env.OAUTH_GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/v1/auth/google/callback'),
  ALLOWED_ORIGINS: Object.freeze(
    allowedOriginsRaw
      .split(',')
      .map((origin) => origin.trim())
  ),
  AI_TIMEOUT_MS: Object.freeze(parseInt(process.env.AI_TIMEOUT_MS || '25000', 10)),
  LOG_LEVEL: Object.freeze(process.env.LOG_LEVEL || 'debug'),
});
