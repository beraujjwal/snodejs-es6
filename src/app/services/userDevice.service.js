'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class UserDevice extends Service {
  /**
   * @description UserDevice service constructor
   * @author Ujjwal Bera
   * @param { string }: model
   * @returns { object } : UserDevice service object
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
      this.instances[model] = new UserDevice(model);
    }
    return this.instances[model];
  }

  async addNewDevice(data, { transaction }) {
    try {
      return await this.model.create(data, { transaction });
    } catch (ex) {
      console.error(ex);
      throw new BaseError(ex);
    }
  }
}

export default UserDevice;
