'use strict';
import Base from '../base/index.js';

import { BaseError } from '../error/baseError.js';

class BaseController extends Base {
  /**
   * Base Controller Layer
   *
   * @author Ujjwal Bera
   * @param null
   */
  constructor(service) {
    super();
    this.service = service;
    this.name = service.name;
  }

  /**
   * Fetches a list of items based on the provided query parameters.
   * Utilizes the service's findAll method to retrieve data and returns a successful response
   * if items are found. Throws a BaseError if there is an issue fetching the items.
   *
   * @author Ujjwal Bera
   * @param {Object} query - Contains the query parameters for fetching items.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while fetching the item list.
   */
  async findAll({ query }, { transaction }) {
    const response = await this.service.findAll(query, { transaction });
    const items = Base.toLabelPluralize(this.name);
    if (response) {
      return {
        code: 200,
        result: response,
        message: __('ITEMS_LIST_FETCH_SUCCESSFULLY', { items: items }),
      };
    }
    throw new BaseError(__('ITEMS_LIST_FETCH_ERROR', { items: items }));
  }

  /**
   * Retrieves a single item based on the provided ID.
   * Utilizes the service's findByPk method to retrieve data and returns a successful response
   * if the item is found. Throws a BaseError if there is an issue fetching the item.
   *
   * @author Ujjwal Bera
   * @param {Object} params - Contains the ID of the item to retrieve.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while fetching the item.
   */
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

  /**
   * Retrieves a single item based on the provided query parameters.
   * Utilizes the service's get method to retrieve data and returns a successful response
   * if the item is found. Throws a BaseError if there is an issue fetching the item.
   *
   * @author Ujjwal Bera
   * @param {Object} params - Contains the query parameters for fetching the item.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while fetching the item.
   */
  async get({ params }, { transaction }) {
    const response = await this.service.get(params, { transaction });
    if (response) {
      return {
        code: 200,
        result: response,
        message: 'Item details was fetched successfully.',
      };
    }
    throw new BaseError('Some error occurred while fetching item details.');
  }

  /**
   * Inserts multiple items into the database.
   * Utilizes the service's insertMany method to add data and returns a successful response
   * if the items are added. Throws a BaseError if there is an issue adding the items.
   *
   * @author Ujjwal Bera
   * @param {Object} body - Contains the data to be inserted into the database.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @param {Object} user - Contains the user context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while adding the items.
   */
  async insertMany({ body }, { transaction, user }) {
    const response = await this.service.insertMany(body, { transaction, user });
    if (response) {
      return {
        code: 200,
        result: response,
        message: 'New items was added successfully.',
      };
    }
    throw new BaseError('Some error occurred while adding new items.');
  }

  /**
   * Creates a new item and adds it to the database.
   * Utilizes the service's createOne method to add the item and returns a successful response
   * if the item is added. Throws a BaseError if there is an issue adding the item.
   *
   * @author Ujjwal Bera
   * @param {Object} body - Contains the data for the item to be created.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @param {Object} user - Contains the user context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while adding the new item.
   */
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

  /**
   * Updates an existing item identified by its primary key.
   * Utilizes the service's updateByPk method to update the item with the provided data
   * and returns a successful response if the update is completed. Throws a BaseError
   * if there is an issue during the update process.
   *
   * @author Ujjwal Bera
   * @param {Object} body - Contains the data to update the item.
   * @param {Object} params - Contains the primary key of the item to update.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @param {Object} user - Contains the user context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while updating the item.
   */
  async updateByPk({ body, params }, { transaction, user }) {
    const { id } = params;
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
    throw new BaseError(
      'No changes detected. The data you submitted is the same as the existing record.'
    );
  }

  /**
   * Updates an existing item.
   * Utilizes the service's update method to update the item with the provided data
   * and returns a successful response if the update is completed. Throws a BaseError
   * if there is an issue during the update process.
   *
   * @author Ujjwal Bera
   * @param {Object} params - Contains the query parameters for fetching the item.
   * @param {Object} body - Contains the data to update the item.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @param {Object} user - Contains the user context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while updating the item.
   */
  async update({ params, body }, { transaction, user }) {
    const response = await this.service.update(params, body, {
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
    throw new BaseError(
      'No changes detected. The data you submitted is the same as the existing record.'
    );
  }

  /**
   * Updates multiple items based on the provided query parameters.
   * Utilizes the service's updateMany method to update items with the provided data
   * and returns a successful response if the update is completed. Throws a BaseError
   * if there is an issue during the update process.
   *
   * @author Ujjwal Bera
   * @param {Object} params - Contains the query parameters for fetching the items.
   * @param {Object} body - Contains the data to update the items.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @param {Object} user - Contains the user context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while updating the items.
   */
  async updateMany({ params, body }, { transaction, user }) {
    const response = await this.service.updateMany(params, body, {
      transaction,
      user,
    });

    if (response) {
      return {
        code: 200,
        result: response,
        message: 'Items was updated successfully.',
      };
    }
    throw new BaseError('Some error occurred while updating the items.');
  }

  /**
   * Toggles the status of a single item identified by its primary key.
   * Utilizes the service's switchStatusByPk method to perform the status update
   * and returns a successful response if the update is completed. Throws a BaseError
   * if there is an issue during the update process.
   *
   * @author Ujjwal Bera
   * @param {Object} params - Contains the primary key of the item to update.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @param {Object} user - Contains the user context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while updating the item's status.
   */
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
    throw new BaseError(
      'No changes detected. The record might already have the same status.'
    );
  }

  /**
   * Deletes a single item identified by its primary key.
   * Utilizes the service's deleteById method to remove the item and returns a successful response
   * if the item is deleted. Throws a BaseError if there is an issue during the deletion process.
   *
   * @author Ujjwal Bera
   * @param {Object} params - Contains the primary key of the item to delete.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @param {Object} user - Contains the user context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while deleting the item.
   */
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

  /**
   * Deletes an item based on the provided query parameters.
   * Utilizes the service's delete method to remove the item and returns a successful response
   * if the deletion is completed. Throws a BaseError if there is an issue during the deletion process.
   *
   * @author Ujjwal Bera
   * @param {Object} query - Contains the query parameters for identifying the item to delete.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @param {Object} user - Contains the user context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while deleting the item.
   */
  async delete({ query }, { transaction, user }) {
    const response = await this.service.delete(query, { transaction, user });
    if (response) {
      return {
        code: 200,
        result: response,
        message: 'The item was deleted successfully.',
      };
    }
    throw new BaseError('Some error occurred while deleting the item.');
  }

  /**
   * Deletes multiple items based on the provided query parameters.
   * Utilizes the service's delete method to remove the items and returns a successful response
   * if the deletion is completed. Throws a BaseError if there is an issue during the deletion process.
   *
   * @author Ujjwal Bera
   * @param {Object} query - Contains the query parameters for identifying the items to delete.
   * @param {Object} transaction - Contains the transaction context for database operations.
   * @param {Object} user - Contains the user context for database operations.
   * @returns {Object} - A response object containing the status code, result, and success message.
   * @throws {BaseError} - If an error occurs while deleting the items.
   */
  async deleteMany({ query }, { transaction, user }) {
    const response = await this.service.delete(query, { transaction, user });
    if (response) {
      return {
        code: 200,
        result: response,
        message: 'Items were deleted successfully.',
      };
    }
    throw new BaseError('Some error occurred while deleting items.');
  }
}

export { BaseController };
