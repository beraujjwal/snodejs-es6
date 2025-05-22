'use strict';

import { Validation } from './validation.js';

class MenuValidation extends Validation {
  /**
   * Menu validation constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
  }

  async create(req, res, next) {
    const validationRule = {
      parent: 'exists:Menu,id',
      name: 'required|string|unique:Menu,name',
      status: 'boolean',
    };
    return await this.validate(req, res, next, validationRule);
  }

  async update(req, res, next) {
    const validationRule = {
      parent: 'exists:Menu,id',
      name: 'required|string|unique:Menu,name,id,' + req.params.id,
      status: 'required|boolean',
    };
    return await this.validate(req, res, next, validationRule);
  }
}
export default new MenuValidation();
