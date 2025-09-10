'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class RoleResourcePermission extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.Role, { foreignKey: 'roleID' });
    this.belongsTo(models.Resource, { foreignKey: 'resourceID' });
    this.belongsTo(models.Permission, { foreignKey: 'permissionID' });
  }
}

RoleResourcePermission.init(
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
      references: { model: 'acl_roles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    resourceID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'acl_resources', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    permissionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'acl_permissions', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Checks if the role-resource-permission is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'RoleResourcePermission',
    tableName: 'acl_role_resource_permissions',
    timestamps: true,
    paranoid: true,
    indexes: [
      { unique: true, fields: ['roleID', 'resourceID', 'permissionID'] },
    ],
    defaultScope: {
      attributes: { exclude: ['deletedAt'] },
      where: { status: true },
    },
  }
);

export default RoleResourcePermission;
