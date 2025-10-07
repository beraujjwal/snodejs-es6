'use strict';
// import { Op } from 'sequelize';
// import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class Menu extends Service {
  /**
   * @description Menu service constructor
   * @author Ujjwal Bera
   * @param { string }: model
   * @returns { object } : Menu service object
   * @throws null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.modelInstances[model] = this.model;
    this.name = model;
  }

  /**
   *
   * @param {string}: model
   * @returns
   */
  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new Menu(model);
    }
    return this.instances[model];
  }
}

export default Menu;
