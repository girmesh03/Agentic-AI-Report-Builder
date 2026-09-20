/**
 * @module errors
 * @description Exported domain error classes.
 */
import { CustomError } from './CustomError.js';
import { HTTP_STATUS } from '../config/httpStatus.js';

export { CustomError };

export class BadRequestError extends CustomError {
  constructor(message = 'Bad request') {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

export class UnauthorizedError extends CustomError {
  constructor(message = 'Authentication required') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

export class ForbiddenError extends CustomError {
  constructor(message = 'Access forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

export class NotFoundError extends CustomError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

export class ConflictError extends CustomError {
  constructor(message = 'Resource conflict detected') {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

export class UnprocessableEntityError extends CustomError {
  constructor(message = 'Validation failed', details = null) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY, details);
  }
}

export class TooManyRequestsError extends CustomError {
  constructor(message = 'Rate limit exceeded. እባክዎ ትንሽ ቆይተው እንደገና ይሞክሩ።') {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS);
  }
}

export class InternalServerError extends CustomError {
  constructor(message = 'Internal server error') {
    super(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

export class BadGatewayError extends CustomError {
  constructor(message = 'Upstream service unavailable') {
    super(message, HTTP_STATUS.BAD_GATEWAY);
  }
}

export class ServiceUnavailableError extends CustomError {
  constructor(message = 'Service temporarily unavailable') {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }
}
