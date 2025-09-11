'use strict';
import { sequelize, DataTypes } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class MenuResource extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.Resource, { foreignKey: 'resourceID' });
    this.belongsTo(models.Menu, { foreignKey: 'menuID' });
  }
}

MenuResource.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    menuID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'acl_menus',
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
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment:
        'This column is for checking if the resource permissions is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'MenuResource',
    tableName: 'acl_menu_resources',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
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
        name: 'idx_unique_acl_menu_resources_fks',
        unique: true,
        fields: ['resourceID', 'menuID', 'status'],
      },
    ],
    hooks: {
      beforeValidate: async (model, options) => {},
    },
  }
);

export default MenuResource;
