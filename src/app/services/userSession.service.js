'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class UserSession extends Service {
  /**
   * Service constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.name = model;
  }

  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new UserSession(model);
    }
    return this.instances[model];
  }

  async addNewDevice(data, { transaction }) {
    try {
      await this.model.create(data, { transaction });
    } catch (ex) {
      console.error(ex);
      throw new BaseError(ex);
    }
  }
}

export default UserSession;
