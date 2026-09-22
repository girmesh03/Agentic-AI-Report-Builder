/**
 * @module validators/validation
 * @description Generic express-validator runner attaching sanitized matchedData to req.validated.
 */
import { validationResult, matchedData } from 'express-validator';
import { UnprocessableEntityError } from '../errors/index.js';

/**
 * Wraps validation rule chains into an Express middleware.
 * @function validate
 * @param {Array<import('express-validator').ValidationChain>} validations - Array of validator chains.
 * @param {object} [options={}] - matchedData options.
 * @returns {import('express').RequestHandler}
 */
export const validate = (validations, options = {}) => async (req, res, next) => {
  // 1. Run all validations concurrently
  await Promise.all(validations.map((validation) => validation.run(req)));

  // 2. Evaluate validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return next(new UnprocessableEntityError('Validation failed', details));
  }

  // 3. Attach sanitized matchedData strictly segregated by location
  req.validated = {
    body: matchedData(req, { ...options, locations: ['body'] }),
    params: matchedData(req, { ...options, locations: ['params'] }),
    query: matchedData(req, { ...options, locations: ['query'] }),
  };

  next();
};

export default validate;
