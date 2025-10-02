'use strict';

import { Validation } from './validation.js';

class PermissionValidation extends Validation {
  /**
   * Validation constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
  }

  async create(req, res, next) {
    const validationRule = {
      name: 'required|string|unique:Permission,name',
    };
    return this.validate(req, res, next, validationRule);
  }

  async update(req, res, next) {
    const validationRule = {
      name: 'required|string|unique:Permission,name,id,' + req.params.id,
      status: 'required|boolean',
    };
    return this.validate(req, res, next, validationRule);
  }
}
export default new PermissionValidation();
