'use strict';
import { sequelize, DataTypes } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class UserResourcePermissionView extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userID' });
    this.belongsTo(models.Resource, { foreignKey: 'resourceID' });
    this.belongsTo(models.Permission, { foreignKey: 'permissionID' });
  }
}

UserResourcePermissionView.init(
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
        model: {
          tableName: 'gnrl_users',
          modelName: 'User',
        },
        key: 'id',
      },
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userPhone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userLoginAttempts: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    userBlockExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resourceID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'acl_resources',
          modelName: 'Resource',
        },
        key: 'id',
      },
    },
    resourceParentID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: {
          tableName: 'acl_resources',
          modelName: 'Resource',
        },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    resourceName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resourceSlug: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    permissionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'acl_permissions',
          modelName: 'Permission',
        },
        key: 'id',
      },
    },
    permissionName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    permissionSlug: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'UserResourcePermissionView',
    tableName: 'user_resource_permissions_view',
    timestamps: false,
    paranoid: false,
  }
);

export default UserResourcePermissionView;
