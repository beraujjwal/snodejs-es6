'use strict';
//import autoBind from '../../system/autobind';
import { Validation } from './validation.js';

class VALIDATION_CAMEL_CASE_SINGULAR_FROMValidation extends Validation {
  /**
   * Validation constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
  }

  // static getInstance() {
  //   if (!this.instances) {
  //     this.instances = new VALIDATION_CAMEL_CASE_SINGULAR_FROMValidation();
  //   }
  //   return this.instances;
  // }

  async create(req, res, next) {
    const validationRule = {
      name: 'required|string',
    };
    return await this.validate(req, res, next, validationRule);
  }

  async update(req, res, next) {
    const validationRule = {
      name: 'required|string',
      status: 'required|boolean',
    };
    return await this.validate(req, res, next, validationRule);
  }
}

export default new VALIDATION_CAMEL_CASE_SINGULAR_FROMValidation();
