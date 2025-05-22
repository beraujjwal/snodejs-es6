'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class UserDevice extends Service {
  /**
   * Service constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
  }

  static getInstance(model) {
    if (!this.instance) {
      this.instance = new UserDevice(model);
    }
    return this.instance;
  }


  async addNewDevice(data, { transaction }) {
    try {
      await this.model.create( data, { transaction });
    } catch (ex) {
      console.error(ex);
      throw new BaseError(ex);
    }
  }
}

export default UserDevice;
