'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class State extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.Country, { foreignKey: 'countryID', as: 'country' });
    this.hasMany(models.City, { foreignKey: 'stateID', as: 'cities' });
  }
}

State.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
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
    },
    stateCode: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true,
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
      comment: 'This column is for checking if the state is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'State',
    tableName: 'gnrl_states',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
    footprint: true, // Enables `lastActivityBy` for last user activity
    defaultScope: {
      attributes: { exclude: ['deletedAt'] },
    },
    scopes: {
      active: { where: { status: true } },
    },
    indexes: [
      { name: 'idx_gnrl_states_name', fields: ['name'] },
      { name: 'idx_unique_gnrl_states_code', fields: ['code'] },
      { name: 'idx_gnrl_states_type', fields: ['type'] },
      { name: 'idx_gnrl_states_status', fields: ['status'] },
    ],
    hooks: {
      beforeValidate: async (model, options) => {},
    },
  }
);

export default State;
