'use strict';
import slugify from 'slugify';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class SubRegion extends BaseModel {
  // ✅ Per-model configuration
  static autoRegisterCommonHooks = true;
  static enableSlug = true;
  static slugField = 'name';
  static slugTargetField = 'slug';

  static enableOrder = true;
  static orderField = 'order';

  static forceStatus = true;
  static associate(models) {
    this.belongsTo(models.Region, { foreignKey: 'regionID', as: 'region' });
  }
}

SubRegion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    regionID: {
      type: DataTypes.INTEGER,
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
      comment:
        'This column is for checking if the sub-region is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'SubRegion',
    tableName: 'gnrl_sub_regions',
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
      {
        name: 'idx_unique_gnrl_sub_regions_slug',
        unique: true,
        fields: ['slug'],
      },
      { name: 'idx_gnrl_sub_regions_name', fields: ['name'] },
      { name: 'idx_gnrl_sub_regions_status', fields: ['status'] },
    ],
    hooks: {
      beforeValidate: async (model, options) => {},
    },
  }
);

export default SubRegion;
