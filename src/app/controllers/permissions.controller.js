'use strict';
//import autoBind from '../../system/autobind';
import { BaseError } from '../../system/core/error/baseError.js';

import Controller from './controller.js';
import Permission from '../services/permission.service.js';

const permissionService = new Permission('Permission');

class PermissionsController extends Controller {
  /**
   * Controller constructor
   * @author Ujjwal Bera
   * @param  {service} service - Service layer object
   */
  constructor(service) {
    super(service);
    this.service = service;
    //autoBind(this);
  }

  /**
   * @desc Fetching list of permissions
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async permissionList({ query }, { transaction }) {
    const result = await this.service.findAllPermissions(
      { query },
      { transaction }
    );
    //if all filter fields name are same as db field name you can just use
    //let result = await this.service.getAll (req.query);
    if (result) {
      return {
        code: 200,
        result,
        message: 'Permission list got successfully.',
      };
    }
    throw new BaseError(
      'Some error occurred while fetching list of permissions.'
    );
  }

  /**
   * @desc Store a new permission
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async permissionStore({ body }, { transaction }) {
    const { name, status } = body;
    //let result = await this.service.permissionStore(name);
    const result = await this.service.permissionStore(
      { name, status },
      { transaction }
    );
    if (result) {
      return {
        code: 201,
        result,
        message: 'New permission created successfully.',
      };
    }
    throw new BaseError('Some error occurred while creating new permission.');
  }

  /**
   * @desc Fetch detail of a permission
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async permissionDetails({ params }, { transaction }) {
    const permissionId = params.id;
    const result = await this.service.findOnePermission(permissionId, {
      transaction,
    });
    if (result) {
      return {
        code: 200,
        result,
        message: 'Permission details fetched successfully.',
      };
    }
    throw new BaseError(
      'Some error occurred while fetching permission details.'
    );
  }

  /**
   * @desc Updated a permission
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async permissionUpdate({ body, params }, { transaction }) {
    const permissionId = params.id;
    const { name, status } = body;
    const result = await this.service.permissionUpdate(
      permissionId,
      {
        name,
        status,
      },
      { transaction }
    );
    if (result) {
      return {
        code: 200,
        result,
        message: 'Permission details updated successfully.',
      };
    }
    throw new BaseError(
      'Some error occurred while updating permission details.'
    );
  }

  async permissionStatusUpdate({ params }, { transaction }) {
    const permissionId = params.id;
    const result = await this.service.permissionStatsUpdate(permissionId, {
      transaction,
    });
    if (result) {
      return {
        code: 200,
        result,
        message: 'Permission details updated successfully.',
      };
    }
    throw new BaseError(
      'Some error occurred while updating permission details.'
    );
  }

  /**
   * @desc Delete a permission
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async permissionDelete({ params }, { transaction }) {
    const permissionId = params.id;
    const result = await this.service.permissionDelete(permissionId, {
      transaction,
    });
    if (result) {
      return {
        code: 200,
        result,
        message: 'Permission deleted successfully.',
      };
    }
    throw new BaseError('Some error occurred while deleting permission.');
  }
}

export default new PermissionsController(permissionService);
