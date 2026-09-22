/**
 * @module utils/constants
 * @description Centralized, immutable system constants for the backend workspace.
 */

/**
 * Password hashing configuration constants.
 * @constant {object}
 */
export const BCRYPT_CONFIG = Object.freeze({
  SALT_ROUNDS: 10,
  MIN_PASSWORD_LENGTH: 8,
});

/**
 * Token expiration lifespans for JWT and session tokens.
 * @constant {object}
 */
export const TOKEN_EXPIRIES = Object.freeze({
  ACCESS_EXPIRY_STRING: '15m',
  REFRESH_EXPIRY_STRING: '7d',
  ACCESS_MAX_AGE_MS: 15 * 60 * 1000, // 15 minutes
  REFRESH_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * Dual httpOnly cookie routing path constants.
 * @constant {object}
 */
export const COOKIE_PATHS = Object.freeze({
  ACCESS_TOKEN: '/',
  REFRESH_TOKEN: '/api/v1/auth',
});

/**
 * Avatar file upload constraints and image processing parameters.
 * @constant {object}
 */
export const AVATAR_CONFIG = Object.freeze({
  MAX_SIZE_BYTES: 15 * 1024 * 1024, // 15 MB
  OUTPUT_WIDTH: 400,
  OUTPUT_HEIGHT: 400,
  OUTPUT_FORMAT: 'webp',
  OUTPUT_QUALITY: 85,
  ALLOWED_MIME_TYPES: Object.freeze(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
});

/**
 * Database collection names across the operational domain model.
 * @constant {object}
 */
export const COLLECTIONS = Object.freeze({
  USERS: 'users',
  REFRESH_TOKENS: 'refreshtokens',
  BRANCHES: 'branches',
  REPORTS: 'reports',
  AUDIO_CLIPS: 'audioclips',
  CHATS: 'chats',
  MESSAGES: 'messages',
  PRESETS: 'presets',
});

/**
 * Default supervisor role and position title.
 * @constant {object}
 */
export const USER_ROLES = Object.freeze({
  DEFAULT_POSITION: 'Area Supervisor',
});

/**
 * Account deletion confirmation sentinel keyword.
 * @constant {string}
 */
export const ACCOUNT_DELETION_SENTINEL = 'DELETE';

/**
 * Standard phone regex pattern for Ethiopian mobile numbers (+251XXXXXXXXX).
 * @constant {RegExp}
 */
export const ETHIOPIAN_PHONE_REGEX = /^\+251[0-9]{9}$/;

/**
 * Branch validation and pagination constraints.
 * @constant {object}
 */
export const BRANCH_CONFIG = Object.freeze({
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 100,
  ADDRESS_MAX_LENGTH: 250,
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  ALLOWED_SORTS: Object.freeze(['name', '-name', 'createdAt', '-createdAt']),
});

export default {
  BCRYPT_CONFIG,
  TOKEN_EXPIRIES,
  COOKIE_PATHS,
  AVATAR_CONFIG,
  COLLECTIONS,
  USER_ROLES,
  ACCOUNT_DELETION_SENTINEL,
  ETHIOPIAN_PHONE_REGEX,
  BRANCH_CONFIG,
};
