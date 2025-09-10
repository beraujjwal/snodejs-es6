'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class Region extends BaseModel {
  // ✅ Per-model configuration
  static autoRegisterCommonHooks = true;
  static enableSlug = true;
  static slugField = 'name';
  static slugTargetField = 'slug';

  static enableOrder = true;
  static orderField = 'order';

  static forceStatus = true;

  static associate(models) {
    // Region has many sub region
    this.hasMany(models.SubRegion, {
      foreignKey: 'regionID',
      as: 'subRegions',
    });
  }
}

Region.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(100),
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
    tableName: 'gnrl_regions',
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
      { name: 'idx_unique_gnrl_regions_slug', unique: true, fields: ['slug'] },
      { name: 'idx_gnrl_regions_name', fields: ['name'] },
      { name: 'idx_gnrl_regions_status', fields: ['status'] },
    ],
    hooks: {
      beforeValidate: async (model) => {},
    },
  }
);

export default Region;
