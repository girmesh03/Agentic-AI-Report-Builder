/**
 * @module validators/reportValidator
 * @description Validation rule chains for Report creation, retrieval, and management operations.
 * Conforms to Master Technical Specification Section 11.4.21–25.
 */
import { body, param, query } from 'express-validator';
import { validate } from './validation.js';

const TIME_24H_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

/**
 * Validation rules for POST /api/v1/reports
 */
export const validateCreateReport = validate([
  body('date')
    .notEmpty()
    .withMessage('Report date is required')
    .custom((value) => {
      // Accepts Ethiopian DD-MM-YY / DD-MM-YYYY or standard ISO date string
      if (typeof value === 'string' && /^\d{1,2}-\d{1,2}-\d{2,4}$/.test(value.trim())) {
        return true;
      }
      const parsed = new Date(value);
      if (isNaN(parsed.getTime())) {
        throw new Error('Valid date is required');
      }
      return true;
    }),
  body('branch')
    .notEmpty()
    .withMessage('Primary branch ID is required')
    .isMongoId()
    .withMessage('Primary branch must be a valid MongoDB ObjectId'),
  body('clockIn')
    .notEmpty()
    .withMessage('Shift clock-in time is required')
    .matches(TIME_24H_REGEX)
    .withMessage('Shift clock-in must follow 24-hour format (HH:mm)'),
  body('clockOut')
    .notEmpty()
    .withMessage('Shift clock-out time is required')
    .matches(TIME_24H_REGEX)
    .withMessage('Shift clock-out must follow 24-hour format (HH:mm)'),
  body('visits')
    .optional()
    .isArray()
    .withMessage('Visits must be an array'),
  body('visits.*.branch')
    .optional()
    .isMongoId()
    .withMessage('Visited branch must be a valid MongoDB ObjectId'),
  body('visits.*.clockIn')
    .optional()
    .matches(TIME_24H_REGEX)
    .withMessage('Visit clock-in must follow 24-hour format (HH:mm)'),
  body('visits.*.clockOut')
    .optional()
    .matches(TIME_24H_REGEX)
    .withMessage('Visit clock-out must follow 24-hour format (HH:mm)'),
  body('activities')
    .optional()
    .isArray()
    .withMessage('Activities must be an array'),
  body('activities.*.text')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Activity description cannot be empty'),
  body('issues')
    .optional()
    .isArray()
    .withMessage('Issues must be an array'),
  body('issues.*.text')
    .optional()
    .trim(),
  body('comments')
    .optional(),
]);

/**
 * Validation rules for GET /api/v1/reports/:reportId
 */
export const validateReportIdParam = validate([
  param('reportId')
    .isMongoId()
    .withMessage('Valid reportId parameter is required'),
]);

/**
 * Validation rules for GET /api/v1/reports
 */
export const validateListReports = validate([
  query('page')
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage('Limit must be between 1 and 100'),
  query('branch')
    .optional()
    .isMongoId()
    .withMessage('Branch filter must be a valid ObjectId'),
  query('type')
    .optional()
    .isIn(['single', 'multi'])
    .withMessage('Type filter must be single or multi'),
  query('isArchived')
    .optional()
    .isBoolean()
    .toBoolean()
    .withMessage('isArchived filter must be a boolean'),
  query('sort')
    .optional()
    .isIn(['date', '-date', 'createdAt', '-createdAt'])
    .withMessage('Invalid sort parameter'),
]);
