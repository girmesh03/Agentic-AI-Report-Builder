/**
 * @module validators/userValidator
 * @description express-validator rule chains for user profile and settings endpoints.
 */
import { body } from 'express-validator';
import { validate } from './validation.js';
import { ACCOUNT_DELETION_SENTINEL, ETHIOPIAN_PHONE_REGEX, BCRYPT_CONFIG } from '../utils/constants.js';

export const validateUpdateProfile = validate([
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(ETHIOPIAN_PHONE_REGEX)
    .withMessage('Phone must be a valid Ethiopian phone number (+251...)'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),
]);

export const validateChangePassword = validate([
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: BCRYPT_CONFIG.MIN_PASSWORD_LENGTH })
    .withMessage(`New password must be at least ${BCRYPT_CONFIG.MIN_PASSWORD_LENGTH} characters long`)
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('confirmPassword')
    .custom((val, { req }) => val === req.body?.newPassword)
    .withMessage('Passwords do not match'),
]);

export const validateDeleteAccount = validate([
  body('confirmation')
    .equals(ACCOUNT_DELETION_SENTINEL)
    .withMessage(`Explicit confirmation string "${ACCOUNT_DELETION_SENTINEL}" is required`),
]);
