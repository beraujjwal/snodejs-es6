'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class Region extends Model {
  static associate(models) {
    // Region has many States
    this.hasMany(models.State, { foreignKey: 'regionID', as: 'states' });
  }
}

Region.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the region is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'Region',
    tableName: 'regions',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ['deletedAt'] },
      where: { status: true },
    },
    scopes: {
      activeRegions: { where: { status: true } },
    },
  }
);

export default Region;
