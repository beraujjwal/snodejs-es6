'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Controller from './controller.js';

import UserDevice from '../services/userDevice.service.js';

class UserDevicesController extends Controller {
  /**
   * @description UserDevice controller constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor(service) {
    super(service);
    this.service = service;
  }

  async findAll({ query }, { transaction }) {
    const response = await this.service.findAll(query, { transaction });
    //const items = Controller.toLabelPluralize(this.name);
    if (response) {
      return {
        code: 200,
        result: response,
        message: 'ITEMS_LIST_FETCH_SUCESSFULLY',
      };
    }
  }

  async findByPk({ params }, { transaction }) {
    const { id } = params;
    const response = await this.service.findByPk(parseInt(id), {
      transaction,
    });
    //const item = Controller.toLabelSingular(this.name);
    if (response) {
      return {
        code: 200,
        result: response,
        message: 'ITEM_DETAIL_FETCH_SUCESSFULLY',
      };
    }
    throw new BaseError('Some error occurred while fetching item details.');
  }

  async createOne({ body }, { transaction, user }) {
    const response = await this.service.createOne(body, { transaction, user });
    if (response) {
      return {
        code: 200,
        result: response,
        message: 'The new item was added successfully.',
      };
    }
    throw new BaseError('Some error occurred while adding the new item.');
  }

  async updateByPk({ body, params }, { transaction, user }) {
    const { id } = params;
    console.info(user);
    const response = await this.service.updateByPk(parseInt(id), body, {
      transaction,
      user,
    });

    if (response) {
      return {
        code: 200,
        result: response,
        message: 'The item was updated successfully.',
      };
    }
    throw new BaseError('Some error occurred while updating the item.');
  }

  async switchStatusByPk({ params }, { transaction, user }) {
    const { id } = params;
    const response = await this.service.switchStatusByPk(parseInt(id), {
      transaction,
      user,
    });

    if (response) {
      return {
        code: 200,
        result: response,
        message: 'The item was updated successfully.',
      };
    }
    throw new BaseError('Some error occurred while updating the item.');
  }

  async deleteById({ params }, { transaction, user }) {
    const { id } = params;
    const response = await this.service.deleteById(parseInt(id), {
      transaction,
      user,
    });
    if (response) {
      return {
        code: 200,
        result: response,
        message: 'The item was deleted successfully.',
      };
    }
    throw new BaseError('Some error occurred while deleting the item.');
  }
}

const userDeviceService = UserDevice.getInstance('UserDevice');

export default new UserDevicesController(userDeviceService);
