'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class MenuResource extends Model {
  static associate(models) {
    this.belongsTo(models.Resource, { foreignKey: 'resourceID' });
    this.belongsTo(models.Menu, { foreignKey: 'menuID' });
  }
}

MenuResource.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    menuID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'menus',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    resourceID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'resources',
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
    tableName: 'menu_resources',
    timestamps: true,
    paranoid: true,
    indexes: [{ unique: true, fields: ['resourceID', 'menuID'] }],
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
      where: {
        status: true,
      },
    },
  }
);

export default MenuResource;
