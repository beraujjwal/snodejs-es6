'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class Permission extends Service {
  /**
   * @description Permission service constructor
   * @author Ujjwal Bera
   * @param { string }: model
   * @returns { object } : Permission service object
   * @throws null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.modelInstances[model] = this.model;
    this.name = model;
  }

  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new Permission(model);
    }
    return this.instances[model];
  }
}

export default Permission;
