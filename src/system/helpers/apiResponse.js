'use strict';

const codesObj = [
  { code: 100, indicate: 'Continue' },
  { code: 101, indicate: 'Switching Protocols' },
  { code: 102, indicate: 'Processing' },
  { code: 103, indicate: 'Early Hints' },
  { code: 200, indicate: 'OK' },
  { code: 201, indicate: 'Created' },
  { code: 202, indicate: 'Accepted' },
  { code: 203, indicate: 'Non-Authoritative Information' },
  { code: 204, indicate: 'No Content' },
  { code: 205, indicate: 'Reset Content' },
  { code: 206, indicate: 'Partial Content' },
  { code: 207, indicate: 'Multi-Status' },
  { code: 208, indicate: 'Already Reported' },
  { code: 226, indicate: 'IM Used' },
  { code: 300, indicate: 'Multiple Choice' },
  { code: 301, indicate: 'Moved Permanently' },
  { code: 302, indicate: 'Found' },
  { code: 303, indicate: 'See Other' },
  { code: 304, indicate: 'Not Modified' },
  { code: 305, indicate: 'Use Proxy' },
  { code: 306, indicate: 'unused' },
  { code: 307, indicate: 'Temporary Redirect' },
  { code: 308, indicate: 'Permanent Redirect' },
  { code: 400, indicate: 'Bad Request' },
  { code: 401, indicate: 'Unauthorized' },
  { code: 402, indicate: 'Payment Required' },
  { code: 403, indicate: 'Forbidden' },
  { code: 404, indicate: 'Not Found' },
  { code: 405, indicate: 'Method Not Allowed' },
  { code: 406, indicate: 'Not Acceptable' },
  { code: 407, indicate: 'Proxy Authentication Required' },
  { code: 408, indicate: 'Request Timeout' },
  { code: 409, indicate: 'Conflict' },
  { code: 410, indicate: 'Gone' },
  { code: 411, indicate: 'Length Required' },
  { code: 412, indicate: 'Precondition Failed' },
  { code: 413, indicate: 'Payload Too Large' },
  { code: 414, indicate: 'URI Too Long' },
  { code: 415, indicate: 'Unsupported Media Type' },
  { code: 416, indicate: 'Range Not Satisfiable' },
  { code: 417, indicate: 'Expectation Failed' },
  { code: 418, indicate: 'I am a teapot' },
  { code: 421, indicate: 'Misdirected Request' },
  { code: 422, indicate: 'Unprocessable Entity' },
  { code: 423, indicate: 'Locked' },
  { code: 424, indicate: 'Failed Dependency' },
  { code: 425, indicate: 'Too Early' },
  { code: 426, indicate: 'Upgrade Required' },
  { code: 428, indicate: 'Precondition Required' },
  { code: 429, indicate: 'Too Many Requests' },
  { code: 431, indicate: 'Request Header Fields Too Large' },
  { code: 451, indicate: 'Unavailable For Legal Reasons' },
  { code: 500, indicate: 'Internal Server Error' },
  { code: 501, indicate: 'Not Implemented' },
  { code: 502, indicate: 'Bad Gateway' },
  { code: 503, indicate: 'Service Unavailable' },
  { code: 504, indicate: 'Gateway Timeout' },
  { code: 505, indicate: 'HTTP Version Not Supported' },
  { code: 506, indicate: 'Variant Also Negotiates' },
  { code: 507, indicate: 'Insufficient Storage' },
  { code: 508, indicate: 'Loop Detected' },
  { code: 510, indicate: 'Not Extended' },
  { code: 511, indicate: 'Network Authentication Required' },
];

export const response = (response) => {
  const { data = [], error = false, message = 'OK', code = 200 } = response;
  let { indicate } = codesObj.find((codeItem) => codeItem.code == code);
  let resData = {
    error,
    code,
    message,
    indicate,
    data,
  };
  return resData;
};

export const successResponse = (data = [], msg = 'OK', code = 200) => {
  let resData = {
    error: false,
    code: code,
    message: msg,
    data: data,
  };
  return resData;
};

export const errorResponse = (err, code = 500) => {
  console.log('Error:', err);
  console.log('Code:', code);
  let { indicate } = codesObj.find((codeItem) => codeItem.code == code);

  let message = null;
  if (typeof err === Object) {
    message = err.message;
  } else if (typeof err === 'object') {
    message = err.message;
  } else if (typeof err === 'string') {
    message = err;
  }
  return {
    error: true,
    code: code,
    message,
    indicate,
    errors: err.errors,
  };
};

export const notFoundResponse = (msg) => {
  return {
    error: true,
    code: 404,
    message: msg,
  };
};

export const validationError = (data, msg = null) => {
  if (msg == null) msg = 'Validation failed';
  return {
    error: true,
    code: 412,
    message: msg,
    errors: data.errors,
  };
};

export const unauthorizedResponse = (msg) => {
  return {
    error: true,
    code: 401,
    message: msg,
  };
};
