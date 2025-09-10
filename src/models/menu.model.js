'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class Menu extends BaseModel {
  // ✅ Per-model configuration
  static autoRegisterCommonHooks = true;
  static enableSlug = true;
  static slugField = 'name';
  static slugTargetField = 'slug';

  static enableOrder = true;
  static orderField = 'order';

  static forceStatus = true;

  static associate(models) {
    this.hasMany(this, {
      as: 'childrens',
      foreignKey: 'parentID',
      attributes: ['id', 'name', 'slug', 'status'],
    });

    this.belongsTo(this, {
      as: 'parent',
      foreignKey: 'parentID',
      attributes: ['id', 'name', 'slug', 'status'],
    });

    this.belongsToMany(models.Resource, {
      through: models.MenuResource,
      foreignKey: 'menuID',
      as: 'menuResources',
      constraints: true,
    });
  }
}

Menu.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    parentID: {
      type: DataTypes.INTEGER,
      references: {
        model: 'acl_menus',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      validate: {
        isInt: true,
        notIn: [[1, 2]],
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isAlpha: true,
        notIn: [['Super Admin', 'Admin']],
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isLowercase: true,
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the menu is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'Menu',
    tableName: 'acl_menus',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
    footprint: true, // Enables `lastActivityBy` for last user activity
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
    },
    scopes: {
      active: { where: { status: true } },
    },
    indexes: [
      {
        name: 'idx_unique_acl_menus_slug',
        unique: true,
        fields: ['slug'],
      },
      { name: 'idx_acl_menus_name', fields: ['name'] },
      { name: 'idx_acl_menus_status', fields: ['status'] },
    ],
    hooks: {
      beforeValidate: async (model, options) => {},
    },
  }
);

export default Menu;
