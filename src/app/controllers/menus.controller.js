'use strict';
//import autoBind from '../../system/autobind';
import { BaseError } from '../../system/core/error/baseError.js';
import Controller from './controller.js';

import Menu from '../services/menu.service.js';

class menusController extends Controller {
  /**
   * @description Menu controller constructor
   * @author Ujjwal Bera
   * @param  {service} service - Service layer object
   */
  constructor(service) {
    super(service);
    this.service = service;
  }
}

const menuService = new Menu('Menu');
export default new menusController(menuService);
