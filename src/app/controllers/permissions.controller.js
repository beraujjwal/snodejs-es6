'use strict';
//import autoBind from '../../system/autobind';
import { BaseError } from '../../system/core/error/baseError.js';

import Controller from './controller.js';
import Permission from '../services/permission.service.js';

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
}

const permissionService = new Permission('Permission');
export default new PermissionsController(permissionService);
