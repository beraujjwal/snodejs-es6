'use strict';
import { Sequelize, Op } from 'sequelize';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

import Resource from './resource.service.js';

class Role extends Service {
  /**
   * @description Role service constructor
   * @author Ujjwal Bera
   * @param { string }: model
   * @returns { object } : Role service object
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
      this.instances[model] = new Role(model);
    }
    return this.instances[model];
  }

  get roleResourcePermission() {
    if (!this.modelInstances['RoleResourcePermission']) {
      this.modelInstances['RoleResourcePermission'] = this.getModel('RoleResourcePermission');
    }
    return this.modelInstances['RoleResourcePermission'];
  }

  async deleteRolePermission({ roleId, permissionId }, { transaction }) {
    const filter = {
      roleID: roleId,
      permissionID: permissionId,
    };
    const result = await this.roleResourcePermission.destroy({
      where: filter,
      transaction,
    });
    if (result) {
      return {
        code: 200,
        message: 'Role permission deleted successfully.',
      };
    }
    return {
      code: 400,
      message: 'Role permission not found.',
    };
  }

  async deleteRoleResource({ roleId, resourceId }, { transaction }) {
    const filter = {
      roleID: roleId,
      resourceID: resourceId,
    };
    const result = await this.roleResourcePermission.destroy({
      where: filter,
      transaction,
    });
    if (result) {
      return {
        code: 200,
        message: 'Role resource deleted successfully.',
      };
    }
    return {
      code: 400,
      message: 'Role resource not found.',
    };
  }
}

export default Role;
