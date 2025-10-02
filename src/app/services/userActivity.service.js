'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class UserActivity extends Service {
  /**
   * @description UserActivity service constructor
   * @author Ujjwal Bera
   * @param { string }: model
   * @returns { object } : UserActivity service object
   * @throws null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.name = model;
  }

  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new UserActivity(model);
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

  async updateActivityBySessionId(sessionID, data, { transaction = null }) {
    try {
      await this.updateOrCreate(null, data, {
        transaction,
        filter: { sessionID, status: 1 },
      });
    } catch (ex) {
      console.error(ex);
      throw new BaseError(ex);
    }
  }
}

export default UserActivity;
