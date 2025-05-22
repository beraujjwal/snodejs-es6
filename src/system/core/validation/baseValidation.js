'use strict';
import autoBind from '../../autobind.js';
import Base from '../base/index.js';

import { validator } from '../helpers/validate.js';
import CustomValidator from '../helpers/customValidator.js';
import { validationError } from '../helpers/apiResponse.js';

class BaseValidation extends Base {
  /**
   * Base Validation Layer
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
    autoBind(this);
  }

  async validate(req, res, next, validationRule, customMessages = {}) {
    await CustomValidator.validate(
      req.body,
      validationRule,
      customMessages,
      async (err, status) => {
        if (!status) {
          return res.status(412).json(validationError(err));
        } else {
          next();
        }
      }
    );
  }
}

export { BaseValidation };
