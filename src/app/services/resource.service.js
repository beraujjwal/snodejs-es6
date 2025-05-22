'use strict';
import { Sequelize, Op } from 'sequelize';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class Resource extends Service {
  /**
   * @description resource service constructor
   * @param null
   * @author Ujjwal Bera
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.permission = this.getModel('Permission');
    this.resourcePermission = this.getModel('ResourcePermission');
  }

  /**
   * @description Fetching list of resources by given query params
   * @param {object} query
   * @returns object
   * @author Ujjwal Bera
   */
  async findAllResources({ query }, { transaction }) {
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
      if (query.parent != null && query.parent.length > 0) {
        filter = { ...filter, parentID: Number(query.parent) };
        query.parentID = Number(query.parent);
        delete query.parent;
      }

      const response = await this.findAll(query, { filter, transaction });

      return response;
    } catch (ex) {
      throw new BaseError(
        ex.message ||
          'An error occurred while fetching resources list. Please try again.',
        ex.status
      );
    }
  }

  /**
   * @description Storing a new resource with given data source
   * @param {object} object
   * @returns object
   * @author Ujjwal Bera
   */
  async resourceStore(
    { name, parentID, status = true, permissions },
    { transaction }
  ) {
    try {
      const resource = await this.createOne(
        {
          name,
          parentID,
          status,
        },
        { transaction }
      );

      await resource.setResourcePermissions(permissions, { transaction });

      return resource;
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while storing a new resource.',
        ex.status
      );
    }
  }

  /**
   * @description Fatching a resource details identified by the given resource ID.
   * @param {String} resourceId
   * @returns object
   * @author Ujjwal Bera
   */
  async findOnePermission(resourceId, { transaction }) {
    try {
      let resource = await this.findByPk(resourceId, { transaction });
      if (!resource)
        throw new BaseError('You have selected an invalid resource.');
      return resource;
    } catch (ex) {
      console.log('ResourceService findOnePermission', ex);
      throw new BaseError(
        ex.message || 'An error occurred while fetching a resource details.',
        ex.status
      );
    }
  }

  /**
   * @description Updating a resource details identified by the given resource ID.
   * @param {String} resourceId
   * @param {*} name
   * @param {*} status
   * @returns object
   * @author Ujjwal Bera
   */
  async resourceUpdate(
    resourceId,
    { name, parentID, status = true, permissions },
    { transaction }
  ) {
    try {
      let resource = await this.findByPk(resourceId, { transaction });
      if (!resource)
        throw new BaseError('You have selected an invalid resource.');

      let data = {};

      if (name != null) data.name = name;
      if (parentID != null) data.parentID = parentID;
      if (status != null) data.status = status;

      await this.updateByPk(resourceId, data, { transaction });

      await this.resourcePermission.destroy({
        where: { resourceID: resourceId },
        truncate: true,
      });

      await resource.setResourcePermissions(permissions, { transaction });

      return await this.findOnePermission(resourceId, { transaction });
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while updating a resource details.',
        ex.status
      );
    }
  }

  /**
   * @description Updating a resource status identified by the given resource ID.
   * @param {*} resourceId
   * @param {*} status
   * @returns
   * @author Ujjwal Bera
   */
  async resourceStatusUpdate(resourceId, status) {
    try {
      const resource = await this.model.findOne({
        _id: resourceId,
        deleted: false,
      });
      if (!resource)
        throw new BaseError('You have selected an invalid resource.');

      if (status) {
        const parentResource = await this.model.findOne({
          _id: resource.parent,
          deleted: false,
        });
        if (parentResource && !parentResource.status)
          throw new BaseError('Please active parent resource before this.');
      } else {
        const childResource = await this.model.findOne({
          parent: resourceId,
          deleted: false,
        });
        if (childResource && childResource.status)
          throw new BaseError('Please in-active child resource before this.');
      }

      await this.model.updateOne(
        { _id: resourceId },
        { $set: { status: status } }
      );

      //await this.updateNestedStatus(resourceId, status);

      return await this.findOnePermission(resourceId, { transaction });
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while changing a resource status.',
        ex.status
      );
    }
  }

  /**
   * @description Check if a resource is deletable, identified by the given resource ID.
   * @param {*} resourceId
   * @returns
   * @author Ujjwal Bera
   */
  async isDeletableResource(resourceId) {
    try {
      let resource = await this.model.findOne({
        _id: resourceId,
        deleted: false,
      });
      if (!resource)
        throw new BaseError('You have selected an invalid resource.');

      const childResource = await this.model.findOne({
        parent: resourceId,
        deleted: false,
      });

      if (childResource)
        throw new BaseError('You have child resource inside it.');

      return true;
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while deleting a resource details.',
        ex.status
      );
    }
  }

  /**
   * @description Delete a resource identified by the given resource ID.
   * @param {*} resourceId  - The ID of the resource to be deleted.
   * @returns
   * @author Ujjwal Bera
   */
  async resourceDelete(resourceId) {
    try {
      let resource = await this.model.findOne({
        _id: resourceId,
        deleted: false,
      });
      if (!resource)
        throw new BaseError('You have selected an invalid resource.');

      await resource.delete();

      return await this.model.findOne({
        _id: resourceId,
        deleted: true,
      });
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while deleting a resource details.',
        ex.status
      );
    }
  }

  async resourcePermissionDelete(
    { resourceId, permissionId },
    { transaction }
  ) {
    const filter = {
      resourceID: resourceId,
      permissionID: permissionId,
    };
    const result = await this.resourcePermission.destroy({
      where: filter,
      transaction,
    });
    if (result) {
      return {
        code: 200,
        message: 'Resource permission deleted successfully.',
      };
    }
    return {
      code: 400,
      message: 'Resource permission not found.',
    };
  }
}

export default Resource;
