'use strict';
import { sequelize, DataTypes } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class Property extends BaseModel {
  // ✅ Per-model configuration
  static autoRegisterCommonHooks = true;
  static enableSlug = true;
  static slugField = 'name';
  static slugTargetField = 'slug';

  static enableOrder = true;
  static orderField = 'order';

  static forceStatus = true;

  static associate(models) {}
}

Property.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true, // 👈 makes slug unique
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT('medium'),
      allowNull: true,
    },
    propertyType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    isCountable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    order: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking status.',
    },
  },
  {
    sequelize,
    modelName: 'Property',
    tableName: 'dm_properties',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
    footprint: true,
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
      where: {
        status: true,
      },
    },
    hooks: {
      beforeValidate: async (model) => {
        // Initial order
        const maxOrder = await ClaimType.max('order');
        model.order = maxOrder + 1;

        // Set status to true if it is not false
        if (model.status !== false) {
          model.status = true;
        }
      },
    },
  }
);

export default Property;
