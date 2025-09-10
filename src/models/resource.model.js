'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class Resource extends BaseModel {
  // ✅ Per-model configuration
  static autoRegisterCommonHooks = true;
  static enableSlug = true;
  static slugField = 'name';
  static slugTargetField = 'slug';

  static enableOrder = true;
  static orderField = 'order';

  static forceStatus = true;

  static associate(models) {
    // Self-referencing associations (Parent-Child)
    this.hasMany(this, {
      as: 'children',
      foreignKey: 'parentID',
      attributes: ['id', 'parentID', 'name', 'slug', 'status'],
    });

    this.belongsTo(this, {
      as: 'parent',
      foreignKey: 'parentID',
      required: false,
      attributes: ['id', 'parentID', 'name', 'slug', 'status'],
      auto: true,
    });

    // Many-to-Many Relations
    this.belongsToMany(models.Permission, {
      through: {
        model: models.ResourcePermission,
        sourceKey: 'permissionID',
        scope: {
          status: true,
          deletedAt: null,
        },
        attributes: [],
      },
      foreignKey: 'resourceID',
      otherKey: 'permissionID',
      as: 'resourcePermissions',
      required: false,
      attributes: ['id', 'name', 'slug', 'status'],
      auto: true,
    });

    this.belongsToMany(models.Permission, {
      through: {
        model: models.RoleResourcePermission,
        sourceKey: 'permissionID',
        scope: {
          status: true,
        },
        attributes: [],
      },
      foreignKey: 'resourceID',
      otherKey: 'permissionID',
      as: 'resourceRolePermissions',
    });

    this.belongsToMany(models.Role, {
      through: models.RoleResourcePermission,
      foreignKey: 'resourceID',
      otherKey: 'roleID',
      as: 'resourcePermissionRoles',
    });

    this.belongsToMany(models.Permission, {
      through: models.UserResourcePermission,
      foreignKey: 'resourceID',
      otherKey: 'permissionID',
      as: 'resourceUserPermissions',
    });

    this.belongsToMany(models.User, {
      through: models.UserResourcePermission,
      foreignKey: 'resourceID',
      otherKey: 'userID',
      as: 'resourcePermissionUsers',
    });

    this.belongsToMany(models.Menu, {
      through: models.MenuResource,
      foreignKey: 'resourceID',
      otherKey: 'menuID',
      as: 'resourceMenus',
    });
  }
}

Resource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    parentID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'acl_resources',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the resource is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'Resource',
    tableName: 'acl_resources',
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
        name: 'idx_unique_acl_resources_slug',
        unique: true,
        fields: ['slug'],
      },
      { name: 'idx_acl_resources_name', fields: ['name'] },
      { name: 'idx_acl_resources_status', fields: ['status'] },
    ],
    hooks: {
      beforeValidate: async (model, options) => {},
    },
  }
);

export default Resource;
