'use strict';
import { sequelize, DataTypes } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class Permission extends BaseModel {
  // ✅ Per-model configuration
  static autoRegisterCommonHooks = true;
  static enableSlug = true;
  static slugField = 'name';
  static slugTargetField = 'slug';

  static enableOrder = true;
  static orderField = 'order';

  static forceStatus = true;

  static associate(models) {
    // Many-to-Many: Permission <-> Resource
    this.belongsToMany(models.Resource, {
      through: models.ResourcePermission,
      foreignKey: 'permissionID',
      otherKey: 'resourceID',
      as: 'permissionResources',
      constraints: true,
    });

    // Many-to-Many: Permission <-> Resource via RoleResourcePermission
    this.belongsToMany(models.Resource, {
      through: models.RoleResourcePermission,
      foreignKey: 'permissionID',
      otherKey: 'resourceID',
      as: 'permissionRoleResources',
      constraints: true,
    });

    // Many-to-Many: Permission <-> Role
    this.belongsToMany(models.Role, {
      through: models.RoleResourcePermission,
      foreignKey: 'permissionID',
      otherKey: 'roleID',
      as: 'permissionResourceRoles',
      constraints: true,
    });

    // Many-to-Many: Permission <-> User
    this.belongsToMany(models.User, {
      through: models.UserResourcePermission,
      foreignKey: 'permissionID',
      otherKey: 'userID',
      as: 'permissionResourceUsers',
      constraints: true,
    });

    // Many-to-Many: Permission <-> Resource via UserResourcePermission
    this.belongsToMany(models.Resource, {
      through: models.UserResourcePermission,
      foreignKey: 'permissionID',
      otherKey: 'resourceID',
      as: 'permissionUserResources',
      constraints: true,
    });
  }
}

Permission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isLowercase: true,
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment:
        'This column is for checking if the permission is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'Permission',
    tableName: 'acl_permissions',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
    footprint: true, // Enables `lastActivityBy` for last user activity
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
    },
    scopes: {
      active: { where: { status: true } },
    },
    indexes: [
      {
        name: 'idx_unique_acl_permissions_slug',
        unique: true,
        fields: ['slug'],
      },
      { name: 'idx_acl_permissions_name', fields: ['name'] },
      { name: 'idx_acl_permissions_status', fields: ['status'] },
    ],
    hooks: {
      beforeValidate: async (model, options) => {},
    },
  }
);

export default Permission;
