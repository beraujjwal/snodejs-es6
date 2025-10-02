'use strict';
import { Op } from 'sequelize';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class Resource extends Service {
  /**
   * @description Resource service constructor
   * @author Ujjwal Bera
   * @param { string }: model
   * @returns { object } : Resource service object
   * @throws null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.name = model;
  }

  get permission() {
    if (!this.modelInstances['Permission']) {
      this.modelInstances['Permission'] = this.getModel('Permission');
    }
    return this.modelInstances['Permission'];
  }

  get resourcePermission() {
    if (!this.modelInstances['ResourcePermission']) {
      this.modelInstances['ResourcePermission'] = this.getModel('ResourcePermission');
    }
    return this.modelInstances['ResourcePermission'];
  }

  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new Resource(model);
    }
    return this.instances[model];
  }

  async resourcePermissionDelete({ resourceId, permissionId }, { transaction }) {
    const filter = {
      resourceID: resourceId,
      permissionID: permissionId,
    };
    const result = await this.resourcePermission.destroy({
      where: filter,
      transaction,
    });
    if (result) {
      return {
        code: 200,
        message: 'Resource permission deleted successfully.',
      };
    }
    return {
      code: 400,
      message: 'Resource permission not found.',
    };
  }
}

export default Resource;
