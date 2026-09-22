/**
 * @module validators/authValidator
 * @description express-validator rule chains for authentication endpoints.
 */
import { body } from 'express-validator';
import { validate } from './validation.js';
import { BCRYPT_CONFIG } from '../utils/constants.js';

export const validateRegister = validate([
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email address is required'),
  body('password')
    .isLength({ min: BCRYPT_CONFIG.MIN_PASSWORD_LENGTH })
    .withMessage(`Password must be at least ${BCRYPT_CONFIG.MIN_PASSWORD_LENGTH} characters long`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body?.password)
    .withMessage('Passwords do not match'),
]);

export const validateLogin = validate([
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
]);

export const validateGoogleCallback = validate([
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Authorization code is required'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State parameter is required'),
  body('codeVerifier')
    .trim()
    .notEmpty()
    .withMessage('PKCE code verifier is required'),
]);
