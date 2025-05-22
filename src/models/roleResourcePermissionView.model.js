'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class RoleResourcePermissionView extends Model {
  static associate(models) {
    this.belongsTo(models.Role, { foreignKey: 'roleID' });
    this.belongsTo(models.Resource, { foreignKey: 'resourceID' });
    this.belongsTo(models.Permission, { foreignKey: 'permissionID' });
  }
}

RoleResourcePermissionView.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    roleID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: {
          tableName: 'roles',
          modelName: 'Role',
        },
        key: 'id',
      },
    },
    roleParentID: {
      type: DataTypes.BIGINT,
      allowNull: true, // Allow null for top-level roles
      references: {
        model: {
          tableName: 'roles',
          modelName: 'Role',
        },
        key: 'id',
      },
    },
    roleName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    roleSlug: {
      type: DataTypes.STRING,
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
    modelName: 'RoleResourcePermissionView',
    tableName: 'role_resource_permissions_view',
    timestamps: false,
    paranoid: false,
  }
);

export default RoleResourcePermissionView;
