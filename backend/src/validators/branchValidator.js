/**
 * @module validators/branchValidator
 * @description Validation rule chains for Branch CRUD and lifecycle operations.
 */
import { body, param, query } from 'express-validator';
import { validate } from './validation.js';
import { ETHIOPIAN_PHONE_REGEX, BRANCH_CONFIG } from '../utils/constants.js';

/**
 * Validation rules for POST /api/v1/branches
 */
export const validateCreateBranch = validate([
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Branch name is required')
    .isLength({ min: BRANCH_CONFIG.NAME_MIN_LENGTH, max: BRANCH_CONFIG.NAME_MAX_LENGTH })
    .withMessage(`Branch name must be between ${BRANCH_CONFIG.NAME_MIN_LENGTH} and ${BRANCH_CONFIG.NAME_MAX_LENGTH} characters`),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(ETHIOPIAN_PHONE_REGEX)
    .withMessage('Phone must follow Ethiopian format (+251XXXXXXXXX)'),
  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: BRANCH_CONFIG.ADDRESS_MAX_LENGTH })
    .withMessage(`Address cannot exceed ${BRANCH_CONFIG.ADDRESS_MAX_LENGTH} characters`),
]);

/**
 * Validation rules for PUT /api/v1/branches/:branchId
 */
export const validateUpdateBranch = validate([
  param('branchId')
    .isMongoId()
    .withMessage('Valid branchId parameter is required'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Branch name cannot be empty')
    .isLength({ min: BRANCH_CONFIG.NAME_MIN_LENGTH, max: BRANCH_CONFIG.NAME_MAX_LENGTH })
    .withMessage(`Branch name must be between ${BRANCH_CONFIG.NAME_MIN_LENGTH} and ${BRANCH_CONFIG.NAME_MAX_LENGTH} characters`),
  body('phone')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .matches(ETHIOPIAN_PHONE_REGEX)
    .withMessage('Phone must follow Ethiopian format (+251XXXXXXXXX)'),
  body('address')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: BRANCH_CONFIG.ADDRESS_MAX_LENGTH })
    .withMessage(`Address cannot exceed ${BRANCH_CONFIG.ADDRESS_MAX_LENGTH} characters`),
]);

/**
 * Validation rules for :branchId parameter
 */
export const validateBranchIdParam = validate([
  param('branchId')
    .isMongoId()
    .withMessage('Valid branchId parameter is required'),
]);

/**
 * Validation rules for GET /api/v1/branches listing
 */
export const validateListBranches = validate([
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: BRANCH_CONFIG.MAX_LIMIT })
    .withMessage(`Limit must be between 1 and ${BRANCH_CONFIG.MAX_LIMIT}`)
    .toInt(),
  query('search')
    .optional()
    .trim()
    .isString(),
  query('isArchived')
    .optional()
    .isBoolean()
    .withMessage('isArchived must be a boolean')
    .toBoolean(),
  query('sort')
    .optional()
    .isIn(BRANCH_CONFIG.ALLOWED_SORTS)
    .withMessage(`Invalid sort parameter. Allowed: ${BRANCH_CONFIG.ALLOWED_SORTS.join(', ')}`),
]);
