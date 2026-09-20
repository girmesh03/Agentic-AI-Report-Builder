/**
 * @module config/env
 * @description Centralized, immutable frontend environment configuration.
 */
/**
 * @typedef {object} ClientEnv
 * @property {string} MODE - Active Vite mode (e.g. 'development' | 'production').
 * @property {boolean} IS_DEV - Whether the application is running in development mode.
 * @property {boolean} IS_PROD - Whether the application is running in production build mode.
 * @property {string} API_BASE_URL - Canonical REST API base endpoint.
 * @property {string} APP_NAME - Public brand application name.
 */

/**
 * Deeply frozen client environment configuration object.
 * @type {Readonly<ClientEnv>}
 */
export const env = Object.freeze({
  MODE: Object.freeze(import.meta.env.MODE),
  IS_DEV: Object.freeze(import.meta.env.DEV),
  IS_PROD: Object.freeze(import.meta.env.PROD),
  API_BASE_URL: Object.freeze(import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1'),
  APP_NAME: Object.freeze(import.meta.env.VITE_APP_NAME || 'Report Builder'),
});
