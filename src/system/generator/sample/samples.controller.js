'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Controller from './controller.js';

import MODEL_SINGULAR_FORM from '../services/CONTROLLER_CAMEL_CASE_SINGULAR.service.js';

class CONTROLLER_CAMEL_CASE_PLURAL_FORMController extends Controller {
  /**
   * Controller constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor(service) {
    super(service);
    this.service = service;
  }

  async findAll({ query }, { transaction }) {
    const response = await this.service.findAll(query, { transaction });
    const items = Base.toLabelPluralize(this.name);
    if (response) {
      return {
        code: 200,
        result: response,
        message: __('ITEMS_LIST_FETCH_SUCESSFULLY', { items: items }),
      };
    }
  }

  async findByPk({ params }, { transaction }) {
    const { id } = params;
    const response = await this.service.findByPk(parseInt(id), {
      transaction,
    });
    const item = Base.toLabelSingular(this.name);
    if (response) {
      return {
        code: 200,
        result: response,
        message: __('ITEM_DETAIL_FETCH_SUCESSFULLY', { item: item }),
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

const CONTROLLER_CAMEL_CASE_SINGULARService = MODEL_SINGULAR_FORM.getInstance(
  'MODEL_SINGULAR_FORM'
);

export default new CONTROLLER_CAMEL_CASE_PLURAL_FORMController(
  CONTROLLER_CAMEL_CASE_SINGULARService
);
