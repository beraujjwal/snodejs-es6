'use strict';
import ExceptionHandlerMiddleware from '../../system/core/middleware/ExceptionHandlerMiddleware.js';

export const exceptionHandler = (controllerFunction) => {
  const instance = new ExceptionHandlerMiddleware(controllerFunction);
  return instance.handle;
};
