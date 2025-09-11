'use strict';
//import autoBind from '../../system/autobind';
import { BaseError } from '../../system/core/error/baseError.js';
import Controller from './controller.js';

import Role from '../services/role.service.js';

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
}

const roleService = Role.getInstance('Role');
export default new RolesController(roleService);
