'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class State extends Model {
  static associate(models) {
    this.belongsTo(models.Country, { foreignKey: 'countryID', as: 'country' });
    this.hasMany(models.City, { foreignKey: 'stateID', as: 'cities' });
  }
}

State.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    countryID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: {
          tableName: 'countries',
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
    tableName: 'states',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ['deletedAt'] },
    },
    scopes: {
      active: { where: { status: true } },
    },
  }
);

export default State;
