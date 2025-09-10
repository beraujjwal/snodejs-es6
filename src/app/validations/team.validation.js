'use strict';
//import autoBind from '../../system/autobind';
import { Validation } from './validation.js';

class TeamValidation extends Validation {
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
  //     this.instances = new TeamValidation();
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

export default new TeamValidation();
