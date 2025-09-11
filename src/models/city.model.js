'use strict';
import { sequelize, DataTypes } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class City extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.State, {
      foreignKey: 'stateID',
      as: 'state',
    });
  }
}

City.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'This column is for name of the city.',
    },
    stateID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'gnrl_states',
          modelName: 'State',
        },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'This column is for making relation between city and state.',
    },
    countryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'gnrl_countries',
          modelName: 'Country',
        },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'This column is for making relation between city and state.',
    },
    latitude: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the city is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'City',
    tableName: 'gnrl_cities',
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
      { name: 'idx_gnrl_cities_name', fields: ['name'] },
      { name: 'idx_gnrl_cities_status', fields: ['status'] },
    ],
    hooks: {
      beforeValidate: async (model, options) => {},
    },
  }
);

export default City;
