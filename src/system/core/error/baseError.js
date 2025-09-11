'use strict';

import statusCodes from './httpStatusCode.js';

class BaseError extends Error {
  /**
   * HTTP BaseError Class
   * @param {string|object} error - Error message or object
   * @param {number} code - HTTP status code (default: 500)
   */
  constructor(error, code = null, isOperational = true) {
    super(typeof error === 'string' ? error : 'Something went wrong!');

    if (!code) code = error?.code || 500;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(this.message).stack;
    }

    this.code = code;
    this.success = false; // clearer than status=false
    this.status = false;
    this.name = statusCodes[code] || 'INTERNAL_SERVER_ERROR';
    this.errors = Array.isArray(error?.errors)
      ? error.errors
      : error?.errors
        ? [error.errors]
        : [];
    this.isOperational = isOperational;
  }

  toJSON() {
    return {
      success: this.success,
      code: this.code,
      name: this.name,
      message: this.message,
      errors: this.errors,
    };
  }

  statusCode() {
    return this.code;
  }
}

class BadRequestError extends Error {
  constructor(message, code) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.success = false;
    this.code = code || 400;
  }

  statusCode() {
    return this.code;
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.success = false;
    this.code = 401;
  }

  statusCode() {
    return this.code;
  }
}

class PaymentRequiredError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.success = false;
    this.code = 402;
  }

  statusCode() {
    return this.code;
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.success = false;
    this.code = 404;
  }

  statusCode() {
    return this.code;
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.success = false;
    this.code = 404;
  }

  statusCode() {
    return this.code;
  }
}

class MethodNotAllowedError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.success = false;
    this.code = 405;
  }

  statusCode() {
    return this.code;
  }
}

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.success = false;
    this.code = 500;
  }

  statusCode() {
    return this.code;
  }
}

class BadGatewayError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.success = false;
    this.code = 502;
  }

  statusCode() {
    return this.code;
  }
}

class ServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.success = false;
    this.code = 503;
  }

  statusCode() {
    return this.code;
  }
}

class CommonErrorError extends Error {
  constructor(message, code) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.message = message;
    this.code = code;
    this.success = false;
  }

  statusCode() {
    return this.code;
  }
}

class ValidationError extends Error {
  /**
   * HTTP Error Class
   * @param error
   */
  constructor(error) {
    super(error);

    Error.captureStackTrace(this, this.constructor);
    this.code = 412;
    this.success = false;
    this.status = false;
    this.message = 'Validation Error';
    this.errors = error;
    this.name = 'PRECONDITION_FAILED';
  }

  statusCode() {
    return this.code;
  }
}

export {
  BaseError,
  BadRequestError,
  UnauthorizedError,
  PaymentRequiredError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  InternalServerError,
  BadGatewayError,
  ServiceUnavailableError,
  CommonErrorError,
  ValidationError,
};
