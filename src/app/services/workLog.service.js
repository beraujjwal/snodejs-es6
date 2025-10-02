'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class WorkLog extends Service {
  /**
   * @description WorkLog service constructor
   * @author Ujjwal Bera
   * @param { string }: model
   * @returns { object } : WorkLog service object
   * @throws null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.name = model;
    this.regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  }

  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new WorkLog(model);
    }
    return this.instances[model];
  }

  async createWorkLog(
    { userID, module, action, referenceID = null, deviceId, data },
    { transaction }
  ) {
    try {
      const userWorkLog = await this.model.create(
        {
          userID,
          module,
          action,
          referenceID,
          deviceId,
          data,
        },
        { transaction, returning: true }
      );

      return userWorkLog;
    } catch (ex) {
      console.error(ex);
      throw new BaseError(ex);
    }
  }
}

export default WorkLog;
