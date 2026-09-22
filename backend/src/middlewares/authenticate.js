/**
 * @module middlewares/authenticate
 * @description Extracts and verifies JWT access token from httpOnly cookie or Authorization header.
 */
import asyncHandler from 'express-async-handler';
import { User } from '../models/User.js';
import { verifyAccessToken } from '../utils/token.js';
import { UnauthorizedError } from '../errors/index.js';

/**
 * Authentication middleware validating access token and attaching req.user.
 * @function authenticate
 * @type {import('express').RequestHandler}
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return next(new UnauthorizedError('Authentication required. Please log in.'));
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new UnauthorizedError('User account not found'));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Session expired. Please refresh your session.'));
    }
    return next(new UnauthorizedError('Invalid authentication token'));
  }
});

export default authenticate;
