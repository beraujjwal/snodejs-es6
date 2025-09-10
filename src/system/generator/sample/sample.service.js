'use strict';
import { Sequelize, Op } from 'sequelize';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class SERVICE_SINGULAR_FORM extends Service {
  /**
   * @description menu service constructor
   * @param null
   * @author Ujjwal Bera
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
  }

  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new SERVICE_SINGULAR_FORM(model);
    }
    return this.instances[model];
  }
}

export default SERVICE_SINGULAR_FORM;
