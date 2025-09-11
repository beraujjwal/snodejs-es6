'use strict';
import { sequelize, DataTypes } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class RoleResourcePermissionView extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.Role, { foreignKey: 'roleID' });
    this.belongsTo(models.Resource, { foreignKey: 'resourceID' });
    this.belongsTo(models.Permission, { foreignKey: 'permissionID' });
  }
}

RoleResourcePermissionView.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    roleID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'acl_roles',
          modelName: 'Role',
        },
        key: 'id',
      },
    },
    roleParentID: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for top-level roles
      references: {
        model: {
          tableName: 'acl_roles',
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
    modelName: 'RoleResourcePermissionView',
    tableName: 'role_resource_permissions_view',
    timestamps: false,
    paranoid: false,
  }
);

export default RoleResourcePermissionView;
