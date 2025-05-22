'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class Menu extends Model {
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
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    parentID: {
      type: DataTypes.BIGINT,
      references: {
        model: 'menus',
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
        async isUnique(value) {
          const menu = await Menu.findOne({
            where: { slug: value, parentID: this.parentID },
          });
          if (menu) {
            throw new Error('Menu name already used.');
          }
        },
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
    tableName: 'menus',
    timestamps: true,
    paranoid: true,
    indexes: [{ unique: true, fields: ['name', 'slug'] }],
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
    },
    scopes: {
      withPermissions: {
        attributes: { exclude: ['createdAt', 'updatedAt', 'deletedAt'] },
      },
    },
    hooks: {
      beforeCreate: async (menu) => {
        // Add custom logic if needed
      },
      beforeUpdate: async (menu) => {
        // Add custom logic if needed
      },
    },
  }
);

export default Menu;
