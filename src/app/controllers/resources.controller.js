'use strict';
//import autoBind from '../../system/autobind';
import { BaseError } from '../../system/core/error/baseError.js';
import Controller from './controller.js';

import Resource from '../services/resource.service.js';
const resourceService = new Resource('Resource');

class resourcesController extends Controller {
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
   * @desc Fetching list of resources
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async resourcesList({ query }, { transaction }) {
    let result = await this.service.findAllResources(
      { query },
      { transaction }
    );
    if (result) {
      return {
        code: 200,
        result,
        message: 'Resources list got successfully.',
      };
    }
    throw new BaseError(
      'Some error occurred while fetching list of resources.'
    );
  }

  /**
   * @desc Fetching list of resources
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async resourcesDDLList({ query }, { transaction }) {
    query.return_type = 'ddl';
    let result = await this.service.resourcesList(query);
    if (result) {
      return {
        code: 200,
        result,
        message: 'Resources list for DDL got successfully.',
      };
    }
    throw new BaseError('Some error occurred while fetching list of roles.');
  }

  /**
   * @desc Store a new resource
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async resourceStore({ body }, { transaction }) {
    let { name, parentID, status, permissions } = body;
    let result = await this.service.resourceStore(
      { name, parentID, status, permissions },
      { transaction }
    );
    if (result) {
      return {
        code: 200,
        result,
        message: 'New resource created successfully.',
      };
    }
    throw new BaseError('Some error occurred while creating new resource.');
  }

  /**
   * @desc Fetch detail of a resource
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async resourceDetails({ params }, { transaction }) {
    let resourceId = params.id;
    console.log(`resourceId => ${resourceId}`);
    let result = await this.service.findOnePermission(resourceId, {
      transaction,
    });
    if (result) {
      return {
        code: 200,
        result,
        message: 'Resource details got successfully.',
      };
    }
    throw new BaseError('Some error occurred while fetching resource details.');
  }

  /**
   * @desc Updated a resource
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async resourceUpdate({ body, params }, { transaction }) {
    let resourceId = params.id;
    let { name, status } = body;
    let result = await this.service.resourceUpdate(
      resourceId,
      { name, status },
      { transaction }
    );
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'Resource details updated successfully!'));
    }
    throw new BaseError('Some error occurred while updating resource details.');
  }

  /**
   * @desc Updated a resource
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async resourceStatusUpdate({ body, params }, { transaction }) {
    let resourceId = params.id;
    let { status } = body;
    let result = await this.service.resourceStatusUpdate(
      { resourceId, status },
      { transaction }
    );
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'Resource details updated successfully!'));
    }
    throw new BaseError('Some error occurred while updating resource details.');
  }

  /**
   * @desc Checking if it a deletable resource
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async isDeletableResource({ params }, { transaction }) {
    let resourceId = params.id;
    let result = await this.service.isDeletableResource(resourceId);
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'You can delete this resource!'));
    }
    throw new BaseError('Some error occurred while deleting resource.');
  }

  /**
   * @desc Delete a resource
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async resourceDelete({ params }, { transaction }) {
    let resourceId = params.id;
    let result = await this.service.resourceDelete(resourceId, { transaction });
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'Resource deleted successfully!'));
    }
    throw new BaseError('Some error occurred while deleting resource.');
  }

  async deleteResourcePermission({ params }, { transaction }) {
    let { resourceId, permissionId } = params;
    let result = await this.service.resourcePermissionDelete(
      { resourceId, permissionId },
      {
        transaction,
      }
    );
    if (result) {
      return {
        code: 200,
        result,
        message: 'Resource permission deleted successfully.',
      };
    }
    throw new BaseError(
      'Some error occurred while deleting resource permission.'
    );
  }
}

export default new resourcesController(resourceService);
