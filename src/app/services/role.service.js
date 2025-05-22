'use strict';
import { Sequelize, Op } from 'sequelize';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

import { validationError } from '../../system/core/error/validationError.js';
import Resource from './resource.service.js';

const resourceService = Resource.getInstance('Resource');

class Role extends Service {
  /**
   * role service constructor
   * @author Ujjwal Bera
   * @param model
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.resource = this.getModel('Resource');
    this.userRole = this.getModel('UserRole');
    this.permission = this.getModel('Permission');
  }

  static getInstance(model) {
    if (!this.instance) {
      this.instance = new Role(model);
    }
    return this.instance;
  }

  async findAllRoles({ query }, { transaction }) {
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

      if (query.resource && query.resource.length > 0) {
        let subCondition = '';
        if (query.permissions && query.permissions.length > 0) {
          const permissions = query.permissions;
          subCondition = `AND "permissionID" IN (${permissions.split(',')})`;
        }
        filter = {
          ...filter,
          id: {
            [Op.in]: Sequelize.literal(
              `(SELECT DISTINCT "roleID" FROM role_resource_permissions WHERE "resourceID" = ${query.resource} ${subCondition} AND status = true AND "deletedAt" IS NULL)`
            ),
          },
        };
      }

      const response = await this.findAll(query, { filter, transaction });

      return response;
    } catch (ex) {
      console.log(ex);
      throw new BaseError(ex);
    }
  }

  async roleStore(
    { parent, name, description, resources, status },
    { transaction }
  ) {
    try {
      console.log({ parent, name, description, resources, status });
      const role = await this.createOne(
        {
          name,
          parentID: parent,
          description,
          status,
        },
        { transaction }
      );

      const roleID = role.id; // Get inserted role ID

      // Step 2: Prepare Resources and Permissions
      for (const resource of resources) {
        const resourceInstance = await resourceService.findByPk(resource.id, {
          transaction,
        });

        if (!resourceInstance) {
          throw new Error(`Resource with ID ${resource.id} not found`);
        }

        // Insert role-resource-permission mapping using custom method
        await this.setRoleResourcePermissions(
          roleID,
          resource.id,
          resource.permissions,
          { transaction }
        );
      }

      return role;
    } catch (ex) {
      console.log(ex);
      throw new BaseError(
        ex.message || `Error fetching ${this.name} details.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  async findOneRole(roleId, { transaction }) {
    try {
      const include = [
        {
          model: this.model,
          as: 'parent',
          attributes: ['id', 'name', 'slug', 'status'],
        },
        {
          model: this.resource,
          as: 'resources',
          attributes: ['id', 'parentID', 'name', 'slug', 'status'],
          through: {
            attributes: [],
          },
          include: [
            {
              model: this.permission,
              as: 'resourceRolePermissions',
              attributes: ['id', 'name', 'slug', 'status'],
              through: {
                attributes: [],
                where: { roleID: roleId },
              },
            },
          ],
        },
      ];
      const role = await this.findByPk(roleId, {
        include,
        transaction,
      });
      if (!role) throw new BaseError('You have selected an invalid role.');
      return role;
    } catch (ex) {
      console.log('RoleService findOneRole', ex);
      throw new BaseError(
        ex.message || 'An error occurred while fetching a role details.',
        ex.status
      );
    }
  }

  async roleUpdate(
    roleId,
    { parent, name, description, resources, status },
    { transaction }
  ) {
    try {
      let role = await this.findByPk(roleId, { transaction });
      if (!role) throw new BaseError('You have selected an invalid role.');

      let data = {};

      if (name != null) data.name = name;
      if (parent != null) data.parentID = parent;
      if (status != null) data.status = status;
      if (description != null) data.description = description;

      const roleUpdate = await this.updateByPk(roleId, data, { transaction });

      for (const resource of resources) {
        const resourceInstance = await resourceService.findByPk(resource.id, {
          transaction,
        });

        if (!resourceInstance) {
          throw new Error(`Resource with ID ${resource.id} not found`);
        }

        // Insert role-resource-permission mapping using custom method
        await this.setRoleResourcePermissions(
          roleId,
          resource.id,
          resource.permissions,
          { transaction }
        );
      }

      return roleUpdate;
    } catch (ex) {
      throw new BaseError(ex.message, ex.status || 500);
    }
  }

  /**
   * @author Ujjwal Bera
   *
   * @param {*} roleId
   * @returns
   */
  async roleCanDelete(roleId) {
    try {
      let role = await this.model.findOne({
        parent: roleId,
        deleted: false,
      });
      if (!role) {
        throw new BaseError('Role not found.');
      }

      await role.delete();

      return await this.model.findOne({
        _id: roleId,
        deleted: true,
      });
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  /**
   * @author Ujjwal Bera
   *
   * @param {*} roleId
   * @returns
   */
  async roleDelete(roleId) {
    try {
      const role = await this.model.findOne({
        _id: roleId,
        deleted: false,
      });
      if (!role) {
        throw new BaseError('Role not found.');
      }

      //If role have child roles then don't allow delete operation
      const childs = await this.model.find({ parent: roleId, deleted: false });
      if (childs.length > 0)
        throw new BaseError(
          'Some child role belongs to this role. If you still want to delete the role? Then delete those child role belongs to this role or shift them into a different role or make them parent role.',
          401
        );

      //If role have users then don't allow delete operation
      const users = await this.db['User'].find({ roles: { $all: [roleId] } });
      if (users.length > 0)
        throw new BaseError(
          'Some user belongs to this role. If you still want to delete the role? Then delete those user belongs to this role or shift them into a different role.',
          401
        );

      await role.delete();
      return await this.model.findOne({
        _id: roleId,
        deleted: true,
      });
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  /**
   * @author Ujjwal Bera
   *
   * @param {*} roleId
   * @returns
   */
  async checkUserRoleAvailablity(
    { roles, parentRole, defaultRole = 'admin' },
    session
  ) {
    try {
      if (!roles) {
        roles = [defaultRole]; // if role is not selected, setting default role for new user
      }

      let dbRoles = await this.db['Role'].findOne({
        slug: { $in: roles },
      });

      console.log('dbRoles', dbRoles);
      if (dbRoles.length !== roles.length) {
        throw new validationError(
          { roles: ['You have selected an invalid role.'] },
          412
        );
      }
      return dbRoles.map((role) => role._id);
    } catch (ex) {
      throw new BaseError(
        ex ||
          'An error occurred while creating your account. Please try again.',
        ex.code
      );
    }
  }

  async createUserRole({ userId, roles }, { transaction }) {
    try {
      const userRoles = await Promise.all(
        roles.map(async (role) => {
          const roleDetails = await this.model.findOne({
            where: { slug: role },
          });

          if (!roleDetails) throw new BaseError(`Role '${role}' not found.`);

          return {
            userID: userId,
            roleID: roleDetails.id,
          };
        })
      );

      // Bulk insert user roles inside the transaction
      await this.userRole.bulkCreate(userRoles, { transaction });
    } catch (ex) {
      console.log('ex', ex);
      throw new BaseError(ex.message);
    }
  }

  /**
   * Custom method to set role resource permissions
   * @param {number} roleId
   * @param {number} resourceId
   * @param {Array} permissions
   * @param {Object} options
   */
  async setRoleResourcePermissions(
    roleId,
    resourceId,
    permissions,
    { transaction }
  ) {
    try {
      // Assuming you have a RoleResourcePermission model
      const RoleResourcePermission = this.getModel('RoleResourcePermission');

      // Delete existing permissions for the role and resource
      await RoleResourcePermission.destroy({
        where: { roleID: roleId, resourceID: resourceId },
        transaction,
      });

      // Insert new permissions
      const permissionRecords = permissions.map((permission) => ({
        roleID: roleId,
        resourceID: resourceId,
        permissionID: permission,
      }));

      await RoleResourcePermission.bulkCreate(permissionRecords, {
        transaction,
      });
    } catch (ex) {
      console.log(ex);
      throw new BaseError(ex);
    }
  }
}

export default Role;
