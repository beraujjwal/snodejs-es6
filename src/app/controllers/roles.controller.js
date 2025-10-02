'use strict';
//import autoBind from '../../system/autobind';
import { BaseError } from '../../system/core/error/baseError.js';
import Controller from './controller.js';

import Role from '../services/role.service.js';

class RolesController extends Controller {
  /**
   * @description Role controller constructor
   * @author Ujjwal Bera
   * @param  {service} service - Service layer object
   */
  constructor(service) {
    super(service);
    this.service = service;
  }

  async deleteRolePermission({ params }, { transaction }) {
    let { roleId, permissionId } = params;
    let result = await this.service.rolePermissionDelete(
      { roleId, permissionId },
      {
        transaction,
      }
    );
    if (result) {
      return {
        code: 200,
        result,
        message: 'Role permission deleted successfully.',
      };
    }
    throw new BaseError('Some error occurred while deleting resource permission.');
  }

  async deleteRoleResource({ params }, { transaction }) {
    let { roleId, resourceId } = params;
    let result = await this.service.roleResourceDelete(
      { roleId, resourceId },
      {
        transaction,
      }
    );
    if (result) {
      return {
        code: 200,
        result,
        message: 'Role resource deleted successfully.',
      };
    }
    throw new BaseError('Some error occurred while deleting resource resource.');
  }
}

const roleService = Role.getInstance('Role');
export default new RolesController(roleService);
