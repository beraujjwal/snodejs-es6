'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class RoleResourcePermission extends Model {
  static associate(models) {
    this.belongsTo(models.Role, { foreignKey: 'roleID' });
    this.belongsTo(models.Resource, { foreignKey: 'resourceID' });
    this.belongsTo(models.Permission, { foreignKey: 'permissionID' });
  }
}

RoleResourcePermission.init(
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
      references: { model: 'roles', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    resourceID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'resources', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    permissionID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: { model: 'permissions', key: 'id' },
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
    tableName: 'role_resource_permissions',
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
