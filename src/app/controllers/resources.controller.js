'use strict';

import { BaseError } from '../../system/core/error/baseError.js';
import Controller from './controller.js';

import Resource from '../services/resource.service.js';

class resourcesController extends Controller {
  /**
   * @description Resource controller constructor
   * @author Ujjwal Bera
   * @param  {service} service - Service layer object
   */
  constructor(service) {
    super(service);
    this.service = service;
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
    throw new BaseError('Some error occurred while deleting resource permission.');
  }
}

const resourceService = new Resource('Resource');
export default new resourcesController(resourceService);
