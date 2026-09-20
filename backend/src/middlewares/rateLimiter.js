/**
 * @module middlewares/rateLimiter
 * @description Rate limiters tiered by resource and endpoint.
 */
import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '../config/httpStatus.js';

const createLimiterResponse = (req, res) => {
  res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
    success: false,
    message: 'Rate limit exceeded. እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።',
    data: null,
  });
};

/**
 * General application rate limiter (300 req / 15m).
 * Exempts /health and /api/v1/health.
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' || req.path === '/api/v1/health',
  handler: createLimiterResponse,
});

/**
 * Auth tier rate limiter (10 req / 15m / IP).
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: createLimiterResponse,
});

/**
 * CRUD tier rate limiter (300 req / 15m / user).
 */
export const crudRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user?._id ? req.user._id.toString() : req.ip),
  handler: createLimiterResponse,
});

/**
 * AI stream tier rate limiter (10 req / 1m / user burst).
 */
export const aiStreamRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user?._id ? req.user._id.toString() : req.ip),
  handler: createLimiterResponse,
});

/**
 * Audio ephemeral rate limiter (20 req / 15m / user).
 */
export const audioRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.user?._id ? req.user._id.toString() : req.ip),
  handler: createLimiterResponse,
});
