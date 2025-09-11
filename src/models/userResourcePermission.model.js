'use strict';
import { sequelize, DataTypes } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class UserResourcePermission extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userID',
      as: 'user',
    });

    this.belongsTo(models.Resource, {
      foreignKey: 'resourceID',
      as: 'resource',
    });

    this.belongsTo(models.Permission, {
      foreignKey: 'permissionID',
      as: 'permission',
    });
  }
}

UserResourcePermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'gnrl_users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    resourceID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'acl_resources',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    permissionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
      comment:
        'This column is for checking if the user resource permission is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'UserResourcePermission',
    tableName: 'acl_user_resource_permissions',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
      where: {
        status: true,
      },
    },
    scopes: {
      activePermissions: {
        where: {
          status: true,
        },
      },
    },
  }
);

export default UserResourcePermission;
