'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class UserResourcePermissionView extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userID' });
    this.belongsTo(models.Resource, { foreignKey: 'resourceID' });
    this.belongsTo(models.Permission, { foreignKey: 'permissionID' });
  }
}

UserResourcePermissionView.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: {
          tableName: 'users',
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
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: {
          tableName: 'resources',
          modelName: 'Resource',
        },
        key: 'id',
      },
    },
    resourceParentID: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: {
          tableName: 'resources',
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
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: {
          tableName: 'permissions',
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
