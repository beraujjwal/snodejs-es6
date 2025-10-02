'use strict';
import { sequelize, DataTypes } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class ResourcePermission extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.Resource, {
      foreignKey: 'resourceID',
      as: 'resource',
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    this.belongsTo(models.Permission, {
      foreignKey: 'permissionID',
      as: 'permission',
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
}

ResourcePermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    resourceID: {
      type: DataTypes.INTEGER,
      allowNull: true, // To avoid foreign key constraint errors
      references: {
        model: 'acl_resources',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    permissionID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'acl_permissions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the resource permission is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'ResourcePermission',
    tableName: 'acl_resource_permissions',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
    footprint: true,
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
      where: {
        status: true,
      },
    },
    indexes: [
      {
        name: 'idx_unique_acl_resource_permissions_fks',
        unique: true,
        fields: ['resourceID', 'permissionID', 'status'],
      },
    ],
    hooks: {
      beforeValidate: async (model, options) => {},
    },
  }
);

export default ResourcePermission;
