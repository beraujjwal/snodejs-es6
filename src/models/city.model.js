'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class City extends Model {
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
      type: DataTypes.BIGINT,
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
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'states',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'This column is for making relation between city and state.',
    },
    countryID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'countries',
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
    tableName: 'cities',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
      where: {
        status: true,
      },
    },
    scopes: {
      activeCities: {
        where: {
          status: true,
        },
      },
    },
  }
);

export default City;
