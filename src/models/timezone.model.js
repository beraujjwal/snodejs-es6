'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class Timezone extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.Region, { foreignKey: 'regionID', as: 'region' });
    this.belongsTo(models.SubRegion, {
      foreignKey: 'subRegionID',
      as: 'subRegion',
    });
  }
}

Timezone.init(
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
      type: DataTypes.STRING(5),
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
        model: {
          tableName: 'gnrl_regions',
          modelName: 'Region',
        },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    subRegionID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'gnrl_sub_regions',
          modelName: 'SubRegion',
        },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    nationality: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    timezoneData: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('timezoneData');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('timezoneData', value ? JSON.stringify(value) : null);
      },
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
      comment: 'This column is for checking if the timezone is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'Timezone',
    tableName: 'gnrl_timezones',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ['deletedAt'] },
    },
    scopes: {
      activeTimezones: { where: { status: true } },
    },
  }
);

export default Timezone;
