'use strict';

class BaseError extends Error {
  /**
   * HTTP Error Class
   * @param {string|object} error - Error message or object
   * @param {number} code - HTTP status code (default: 500)
   */
  constructor(error, code = 500) {
    super(typeof error === 'string' ? error : 'Something went wrong!');

    Error.captureStackTrace(this, this.constructor);

    const statusCodes = {
      100: 'CONTINUE',
      101: 'SWITCHING_PROTOCOLS',
      102: 'PROCESSING',
      103: 'EARLY_HINTS',
      200: 'OK',
      201: 'CREATED',
      202: 'ACCEPTED',
      203: 'NON_AUTHORITATIVE_INFORMATION',
      204: 'NO_CONTENT',
      205: 'RESET_CONTENT',
      206: 'PARTIAL_CONTENT',
      207: 'MULTI_STATUS',
      208: 'ALREADY_REPORTED',
      226: 'IM_USED',
      300: 'MULTIPLE_CHOICES',
      301: 'MOVED_PERMANENTLY',
      302: 'FOUND',
      303: 'SEE_OTHER',
      304: 'NOT_MODIFIED',
      305: 'USE_PROXY',
      307: 'TEMPORARY_REDIRECT',
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      405: 'METHOD_NOT_ALLOWED',
      406: 'NOT_ACCEPTABLE',
      407: 'PROXY_AUTHENTICATION_REQUIRED',
      408: 'REQUEST_TIMEOUT',
      409: 'CONFLICT',
      410: 'GONE',
      411: 'LENGTH_REQUIRED',
      412: 'PRECONDITION_FAILED',
      413: 'REQUEST_ENTITY_TOO_LARGE',
      414: 'REQUEST_URI_TOO_LONG',
      415: 'UNSUPPORTED_MEDIA_TYPE',
      416: 'REQUESTED_RANGE_NOT_SATISFIABLE',
      417: 'EXPECTATION_FAILED',
      419: 'MISSING_ARGUMENTS',
      420: 'INVALID_ARGUMENTS',
      422: 'MISSING_REQUIRED_FIELDS',
      500: 'INTERNAL_SERVER_ERROR',
      501: 'NOT_IMPLEMENTED',
      502: 'BAD_GATEWAY',
      503: 'SERVICE_UNAVAILABLE',
      504: 'GATEWAY_TIMEOUT',
      505: 'HTTP_VERSION_NOT_SUPPORTED',
      550: 'INITIALIZATION_FAILURE',
    };

    this.code = code;
    this.status = false;
    this.name = statusCodes[code] || 'INTERNAL_SERVER_ERROR';
    this.errors = error?.errors || null;
  }
}

export { BaseError };
