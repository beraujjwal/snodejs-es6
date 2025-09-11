'use strict';
import { sequelize, DataTypes } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class Role extends BaseModel {
  // ✅ Per-model configuration
  static autoRegisterCommonHooks = true;
  static enableSlug = true;
  static slugField = 'name';
  static slugTargetField = 'slug';

  static enableOrder = true;
  static orderField = 'order';

  static forceStatus = true;

  static associate(models) {
    // Self-referencing relationship for parent roles
    this.belongsTo(this, {
      as: 'parent',
      foreignKey: 'parentID',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Many-to-Many with Users
    this.belongsToMany(models.User, {
      through: { model: 'UserRole', scope: { status: true } },
      as: 'users',
      foreignKey: 'roleID',
      otherKey: 'userID',
    });

    // Many-to-Many with Resources
    this.belongsToMany(models.Resource, {
      through: { model: 'RoleResourcePermission', scope: { status: true } },
      attributes: ['id', 'parentID', 'name', 'slug', 'status'],
      as: 'resources',
      foreignKey: 'roleID',
      otherKey: 'resourceID',
      auto: true,
    });

    // Many-to-Many with Permissions
    this.belongsToMany(models.Permission, {
      through: { model: 'RoleResourcePermission', scope: { status: true } },
      attributes: ['id', 'name', 'slug', 'status'],
      as: 'permissions',
      foreignKey: 'roleID',
      otherKey: 'permissionID',
    });
  }
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    parentID: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for top-level roles
      references: {
        model: 'acl_roles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      validate: {
        isInt: true,
        notIn: [[1, 2]],
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: true,
        notIn: [['Super Admin', 'Admin']],
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
    description: {
      type: DataTypes.TEXT('medium'),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the role is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'acl_roles',
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
        name: 'idx_unique_acl_roles_slug',
        unique: true,
        fields: ['slug'],
      },
      { name: 'idx_acl_roles_name', fields: ['name'] },
      { name: 'idx_acl_roles_status', fields: ['status'] },
    ],
    hooks: {
      beforeValidate: async (model, options) => {},
    },
  }
);

export default Role;
