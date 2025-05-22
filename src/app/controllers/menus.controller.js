'use strict';
//import autoBind from '../../system/autobind';
import { BaseError } from '../../system/core/error/baseError.js';
import Controller from './controller.js';

import Menu from '../services/menu.service.js';
const menuService = new Menu('Menu');

class menusController extends Controller {
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
   * @desc Fetching list of menus
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async menusList({ query }, { transaction }) {
    let result = await this.service.findAllMenus({ query }, { transaction });
    if (result) {
      return {
        code: 200,
        result,
        message: 'Menus list got successfully.',
      };
    }
    throw new BaseError('Some error occurred while fetching list of menus.');
  }

  /**
   * @desc Fetching list of menus
   * @param {*} req
   * @param {*} res
   * @param {*} next
   */
  async menusDDLList({ query }, { transaction }) {
    query.return_type = 'ddl';
    let result = await this.service.menusList(query);
    if (result) {
      return {
        code: 200,
        result,
        message: 'Menus list for DDL got successfully.',
      };
    }
    throw new BaseError('Some error occurred while fetching list of roles.');
  }

  /**
   * @desc Store a new menu
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async menuStore({ body }, { transaction }) {
    let { name, parentID, status, permissions } = body;
    let result = await this.service.menuStore(
      { name, parentID, status, permissions },
      { transaction }
    );
    if (result) {
      return {
        code: 200,
        result,
        message: 'New menu created successfully.',
      };
    }
    throw new BaseError('Some error occurred while creating new menu.');
  }

  /**
   * @desc Fetch detail of a menu
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async menuDetails({ params }, { transaction }) {
    let menuId = params.id;
    console.log(`menuId=>${menuId}`);
    let result = await this.service.findOnePermission(menuId, { transaction });
    if (result) {
      return {
        code: 200,
        result,
        message: 'Menu details got successfully.',
      };
    }
    throw new BaseError('Some error occurred while fetching menu details.');
  }

  /**
   * @desc Updated a menu
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async menuUpdate({ body, params }, { transaction }) {
    let menuId = params.id;
    let { name, status } = body;
    let result = await this.service.menuUpdate(
      menuId,
      { name, status },
      { transaction }
    );
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'Menu details updated successfully!'));
    }
    throw new BaseError('Some error occurred while updating menu details.');
  }

  /**
   * @desc Updated a menu
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async menuStatusUpdate({ body, params }, { transaction }) {
    let menuId = params.id;
    let { status } = body;
    let result = await this.service.menuStatusUpdate(
      { menuId, status },
      { transaction }
    );
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'Menu details updated successfully!'));
    }
    throw new BaseError('Some error occurred while updating menu details.');
  }

  /**
   * @desc Checking if it a deletable menu
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async isDeletableMenu({ params }, { transaction }) {
    let menuId = params.id;
    let result = await this.service.isDeletableMenu(menuId);
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'You can delete this menu!'));
    }
    throw new BaseError('Some error occurred while deleting menu.');
  }

  /**
   * @desc Delete a menu
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @author Ujjwal Bera
   */
  async menuDelete({ params }, { transaction }) {
    let menuId = params.id;
    let result = await this.service.menuDelete(menuId, { transaction });
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'Menu deleted successfully!'));
    }
    throw new BaseError('Some error occurred while deleting menu.');
  }
}

export default new menusController(menuService);
