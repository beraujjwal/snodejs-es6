'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

import { error } from '../../helpers/logger.js';

class UserSession extends Service {
  /**
   * @description UserSession service constructor
   * @author Ujjwal Bera
   * @param { string }: model
   * @returns { object } : UserSession service object
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
      this.instances[model] = new UserSession(model);
    }
    return this.instances[model];
  }

  async addNewDevice(data, { transaction }) {
    try {
      await this.model.create(data, { transaction });
    } catch (ex) {
      error(ex);
      throw new BaseError(ex);
    }
  }
}

export default UserSession;
