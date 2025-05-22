'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class Country extends Model {
  static associate(models) {
    this.hasMany(models.State, { foreignKey: 'countryID', as: 'states' });
  }
}

Country.init(
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
    },
    iso3: {
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true,
    },
    iso2: {
      type: DataTypes.STRING(2),
      allowNull: false,
      unique: true,
    },
    numericCode: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    phoneCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    capital: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
    },
    currencyName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    currencySymbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    tld: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    native: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    regionID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'regions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    subRegionID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'sub_regions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    timezones: {
      type: DataTypes.TEXT,
      get() {
        return JSON.parse(this.getDataValue('timezones'));
      },
      set(value) {
        this.setDataValue('timezones', JSON.stringify(value));
      },
      defaultValue: null,
    },
    latitude: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    longitude: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    emoji: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the country is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'Country',
    tableName: 'countries',
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
      activeCountries: {
        where: {
          status: true,
        },
      },
    },
  }
);

export default Country;
