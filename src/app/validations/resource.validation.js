'use strict';

import { Validation } from './validation.js';

class ResourceValidation extends Validation {
  /**
   * Resource validation constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
  }

  async create(req, res, next) {
    const validationRule = {
      parent: 'exists:Resource,id',
      name: 'required|string|unique:Resource,name',
      permissions: 'required|exists:Permission,id',
      status: 'boolean',
    };
    return await this.validate(req, res, next, validationRule);
  }

  async update(req, res, next) {
    const validationRule = {
      parent: 'exists:Resource,id',
      name: 'required|string|unique:Resource,name,id,' + req.params.id,
      permissions: 'required|exists:Permission,id',
      status: 'required|boolean',
    };
    return await this.validate(req, res, next, validationRule);
  }
}
export default new ResourceValidation();
