'use strict';
import { Sequelize, Op } from 'sequelize';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class Menu extends Service {
  /**
   * @description menu service constructor
   * @param null
   * @author Ujjwal Bera
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.permission = this.getModel('Permission');
    this.menuPermission = this.getModel('MenuPermission');
  }

  /**
   * @description Fetching list of menus by given query params
   * @param {object} query
   * @returns object
   * @author Ujjwal Bera
   */
  async findAllMenus({ query }, { transaction }) {
    try {
      let { order_by, order, limit, page, ...search } = query;
      let filter = {};
      if (search.name != null && search.name.length > 0) {
        filter = { ...filter, name: { [Op.like]: `%${search.name}%` } };
      }

      if (order_by === 'parent') {
        query.order_by = 'parentID';
        query.order_by_can_be_null = true;
      }
      if(query.parent != null && query.parent.length > 0) {
        filter = { ...filter, parentID: Number(query.parent) };
        query.parentID = Number(query.parent);
        delete query.parent;
      }

      const response = await this.findAll(query, { filter, transaction });

      return response;
    } catch (ex) {
      throw new BaseError(
        ex.message ||
          'An error occurred while fetching menus list. Please try again.',
        ex.status
      );
    }
  }

  /**
   * @description Storing a new menu with given data source
   * @param {object} object
   * @returns object
   * @author Ujjwal Bera
   */
  async menuStore(
    { name, parentID, status = true, permissions },
    { transaction }
  ) {
    try {
      const menu = await this.createOne(
          {
            name,
            parentID,
            status,
          },
        { transaction }
      );

      await menu.setMenuPermissions(permissions, { transaction });

      return menu;
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while storing a new menu.',
        ex.status
      );
    }
  }

  /**
   * @description Fatching a menu details identified by the given menu ID.
   * @param {String} menuId
   * @returns object
   * @author Ujjwal Bera
   */
  async findOnePermission(menuId, { transaction }) {
    try {
      let menu = await this.findByPk(menuId, { transaction });
      if (!menu)
        throw new BaseError('You have selected an invalid menu.');
      return menu;
    } catch (ex) {
      console.log('MenuService findOnePermission', ex);
      throw new BaseError(
        ex.message || 'An error occurred while fetching a menu details.',
        ex.status
      );
    }
  }

  /**
   * @description Updating a menu details identified by the given menu ID.
   * @param {String} menuId
   * @param {*} name
   * @param {*} status
   * @returns object
   * @author Ujjwal Bera
   */
  async menuUpdate(menuId, { name, parentID, status = true, permissions }, { transaction }) {
    try {
      let menu = await this.findByPk(menuId, { transaction });
      if (!menu)
        throw new BaseError('You have selected an invalid menu.');

      let data = {};

      if (name != null) data.name = name;
      if (parentID != null) data.parentID = parentID;
      if (status != null) data.status = status;

      await this.updateByPk(menuId, data, { transaction });

      await this.menuPermission.destroy({ where: { menuID: menuId }, truncate: true });

      await menu.setMenuPermissions(permissions, { transaction });

      return await this.findOnePermission(menuId, { transaction });
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while updating a menu details.',
        ex.status
      );
    }
  }

  /**
   * @description Updating a menu status identified by the given menu ID.
   * @param {*} menuId
   * @param {*} status
   * @returns
   * @author Ujjwal Bera
   */
  async menuStatusUpdate(menuId, status) {
    try {
      const menu = await this.model.findOne({
        _id: menuId,
        deleted: false,
      });
      if (!menu)
        throw new BaseError('You have selected an invalid menu.');

      if (status) {
        const parentMenu = await this.model.findOne({
          _id: menu.parent,
          deleted: false,
        });
        if (parentMenu && !parentMenu.status)
          throw new BaseError('Please active parent menu before this.');
      } else {
        const childMenu = await this.model.findOne({
          parent: menuId,
          deleted: false,
        });
        if (childMenu && childMenu.status)
          throw new BaseError('Please in-active child menu before this.');
      }

      await this.model.updateOne(
        { _id: menuId },
        { $set: { status: status } }
      );

      //await this.updateNestedStatus(menuId, status);

      return await this.findOnePermission(menuId, { transaction });
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while changing a menu status.',
        ex.status
      );
    }
  }

  /**
   * @description Check if a menu is deletable, identified by the given menu ID.
   * @param {*} menuId
   * @returns
   * @author Ujjwal Bera
   */
  async isDeletableMenu(menuId) {
    try {
      let menu = await this.model.findOne({
        _id: menuId,
        deleted: false,
      });
      if (!menu)
        throw new BaseError('You have selected an invalid menu.');

      const childMenu = await this.model.findOne({
        parent: menuId,
        deleted: false,
      });

      if (childMenu)
        throw new BaseError('You have child menu inside it.');

      return true;
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while deleting a menu details.',
        ex.status
      );
    }
  }

  /**
   * @description Delete a menu identified by the given menu ID.
   * @param {*} menuId  - The ID of the menu to be deleted.
   * @returns
   * @author Ujjwal Bera
   */
  async menuDelete(menuId) {
    try {
      let menu = await this.model.findOne({
        _id: menuId,
        deleted: false,
      });
      if (!menu)
        throw new BaseError('You have selected an invalid menu.');

      await menu.delete();

      return await this.model.findOne({
        _id: menuId,
        deleted: true,
      });
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while deleting a menu details.',
        ex.status
      );
    }
  }
}

export default Menu;
