'use strict';
import { sequelize, DataTypes } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class Country extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.hasMany(models.State, { foreignKey: 'countryID', as: 'states' });
    this.belongsTo(models.Region, { foreignKey: 'regionID', as: 'region' });
    this.belongsTo(models.SubRegion, {
      foreignKey: 'subRegionID',
      as: 'subRegion',
    });
  }
}

Country.init(
  {
    id: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'gnrl_regions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    subRegionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'gnrl_sub_regions',
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
    tableName: 'gnrl_countries',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
    footprint: true, // Enables `lastActivityBy` for last user activity
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
    },
    scopes: {
      active: {
        where: {
          status: true,
        },
      },
    },
    indexes: [
      {
        name: 'idx_unique_gnrl_countries_iso2',
        unique: true,
        fields: ['iso2'],
      },
      {
        name: 'idx_unique_gnrl_countries_iso3',
        unique: true,
        fields: ['iso3'],
      },
      { name: 'idx_gnrl_countries_name', fields: ['name'] },
      { name: 'idx_gnrl_countries_phone_code', fields: ['phoneCode'] },
      { name: 'idx_gnrl_countries_numeric_code', fields: ['numericCode'] },
      { name: 'idx_gnrl_countries_status', fields: ['status'] },
    ],
    hooks: {
      //beforeValidate: async (model, options) => {},
    },
  }
);

export default Country;
