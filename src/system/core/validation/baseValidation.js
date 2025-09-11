'use strict';
import Base from '../base/index.js';

import CustomValidator from '../helpers/customValidator.js';
import { validationErrorResponse } from '../helpers/apiResponse.js';

class BaseValidation extends Base {
  /**
   * Base Validation Layer
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
  }

  /**
   * Validates the request body against the provided validation rules.
   *
   * @author Ujjwal Bera
   * @param {Object} req - The HTTP request object.
   * @param {Object} res - The HTTP response object.
   * @param {Function} next - The next middleware function in the stack.
   * @param {Object} validationRule - The set of validation rules.
   * @param {Object} [customMessages={}] - Custom error messages for validation failures.
   * @returns {void}
   * If validation fails, responds with a 412 status and validation error message.
   * Calls `next()` middleware if validation succeeds.
   */

  async validate(req, res, next, validationRule, customMessages = {}) {
    await CustomValidator.validate(
      req.body,
      validationRule,
      customMessages,
      async (err, status) => {
        if (!status) {
          return res.status(412).json(validationErrorResponse(err));
        } else {
          next();
        }
      }
    );
  }
}

export { BaseValidation };
