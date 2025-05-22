'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class Permission extends Service {
  /**
   * permission service constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.name = 'Permission';
  }

  async findAllPermissions({ query }, { transaction }) {
    try {
      // let { order_by, order, limit, page, ...search } = query;
      // let filter = {};
      // if (search.name != null && search.name.length > 0) {
      //   filter = { ...filter, name: new RegExp(search.name, 'i') };
      // }

      return await this.findAll(query, { transaction });
    } catch (ex) {
      console.log('ex', ex);
      throw new BaseError(ex);
    }
  }

  async permissionStore({ name, status = true }, { transaction }) {
    try {
      const permission = await this.createOne(
        {
          name,
          status,
        },
        { transaction } 
      );

      //await permissionGraph.create(permission[0]);
      return permission;
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  async findOnePermission(permissionId, { transaction }) {
    try {
      let permission = await this.findOne({ id: permissionId }, { transaction });
      if (!permission) {
        throw new BaseError('Permission not found with this given details.');
      }
      return permission;
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  async permissionUpdate(permissionId,  { name, status }, { transaction }) {
    try {
      return await this.updateByPk(
        permissionId,
        {
          name: name,
          status: status,
        },
        { transaction }
      );
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  async permissionStatsUpdate(permissionId,  { transaction }) {
    try {
      const permission = await this.findByPk(permissionId, { transaction });
      const permissionData = {
        name: permission.name,
        status: !permission.status,
      }
      return await this.updateByPk(
        permissionId,
        {
          ...permissionData,
        },
        { transaction }
      );
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  async permissionDelete(permissionId, { transaction }) {
    try {
      return await this.destroyByPk(permissionId, { transaction });
    } catch (ex) {
      console.log('ex', ex);
      throw new BaseError(ex);
    }
  }
}

export default Permission;
