/**
 * @module errors/CustomError
 * @description Base class for all operational domain errors.
 */
export class CustomError extends Error {
  /**
   * @param {string} message - Human-readable error message.
   * @param {number} statusCode - HTTP status code.
   * @param {Array<{field: string, message: string}> | null} [details=null] - Validation error details.
   */
  constructor(message, statusCode, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
