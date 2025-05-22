'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class ResourcePermission extends Model {
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
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    resourceID: {
      type: DataTypes.BIGINT,
      allowNull: true, // To avoid foreign key constraint errors
      references: {
        model: 'resources',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    permissionID: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'permissions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment:
        'This column is for checking if the resource permission is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'ResourcePermission',
    tableName: 'resource_permissions',
    timestamps: true,
    paranoid: true,
    indexes: [{ unique: true, fields: ['resourceID', 'permissionID'] }],
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
      where: {
        status: true,
      },
    },
  }
);

export default ResourcePermission;
