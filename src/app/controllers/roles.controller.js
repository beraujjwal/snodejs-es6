'use strict';
//import autoBind from '../../system/autobind';
import { BaseError } from '../../system/core/error/baseError.js';
import Controller from './controller.js';

import Role from '../services/role.service.js';
const roleService = Role.getInstance('Role');

class RolesController extends Controller {
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
   * @desc Fetching list of roles
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async rolesList({ query }, { transaction }) {
    let result = await this.service.findAllRoles({ query }, { transaction });
    if (result) {
      return {
        code: 200,
        result,
        message: 'ROLES_LIST_FETCH_SUCESSFULLY',
      };
    }
    throw new BaseError(__('ROLES_LIST_FETCH_ERROR'));
  }

  /**
   * @desc Fetching list of roles
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async rolesDDLList({ query }, { transaction }) {
    query.return_type = 'ddl';
    let result = await this.service.rolesList(query);
    if (result) {
      return {
        code: 200,
        result,
        message: 'Roles list for DDL got successfully.',
      };
    }
    throw new BaseError('Some error occurred while fetching list of roles.');
  }

  /**
   * @desc Store a new role
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async roleStore({ body }, { transaction }) {
    const { parent, name, description, resources, status } = body;
    const result = await this.service.roleStore(
      { parent, name, description, resources, status },
      { transaction }
    );

    if (result) {
      return {
        code: 201,
        result,
        message: 'New role created successfully.',
      };
    }
    //throw new BaseError('Some error occurred while creating new role.');
  }

  async roleDetails({ params }, { transaction }) {
    let roleId = params.id;
    let result = await this.service.findOneRole(roleId, { transaction });
    if (result) {
      return {
        code: 201,
        result,
        message: 'Role details got successfully.',
      };
    }
    throw new BaseError('Some error occurred while fetching role details.');
  }

  async roleUpdate({ body, params }, { transaction }) {
    let roleId = params.id;
    const { parent, name, description, resources, status } = body;
    let result = await this.service.roleUpdate(
      roleId,
      { parent, name, description, resources, status },
      { transaction }
    );
    if (result) {
      return {
        code: 200,
        result,
        message: 'Role details updated successfully.',
      };
    }
    throw new BaseError('Some error occurred while updating role details.');
  }

  /**
   * @desc Delete a role
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async roleCanDelete({ params }, { transaction }) {
    let roleId = params.id;
    let result = await this.service.roleCanDelete(roleId);
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'Role can deletable successfully!'));
    }
    throw new BaseError(
      'Some error occurred while checking role deletability.'
    );
  }

  /**
   * @desc Delete a role
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async roleDelete({ params }, { transaction }) {
    let roleId = params.id;
    let result = await this.service.roleDelete(roleId, { transaction });
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'Role deleted successfully!'));
    }
    throw new BaseError('Some error occurred while deleting role.');
  }
}

export default new RolesController(roleService);
