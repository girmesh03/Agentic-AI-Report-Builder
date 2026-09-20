/**
 * @module middlewares/requestLogger
 * @description Morgan HTTP logging middleware with development terminal formatting and production Winston stream.
 */
import morgan from 'morgan';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

// List of sensitive payload keys masked in log output
const SENSITIVE_FIELDS = ['password', 'confirmPassword', 'currentPassword', 'newPassword', 'token', 'refreshToken'];

/**
 * Sanitizes an object by recursively masking sensitive field values.
 * @param {object} obj - Target object to sanitize.
 * @returns {object} Sanitized clone.
 */
export const sanitizePayload = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const key of Object.keys(sanitized)) {
    if (SENSITIVE_FIELDS.includes(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizePayload(sanitized[key]);
    }
  }
  return sanitized;
};

// Stream pipe for production Winston integration
const winstonStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * Exported request logger middleware configured for active environment.
 */
export const requestLogger =
  env.NODE_ENV === 'development'
    ? morgan('dev') // Colorized terminal output for developers
    : morgan(
        ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
        { stream: winstonStream }
      );
