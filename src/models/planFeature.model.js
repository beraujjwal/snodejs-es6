'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class PlanFeature extends Model {
  static associate(models) {
    // PlanFeature has many States
    this.hasMany(models.State, { foreignKey: 'planID', as: 'states' });
  }
}

PlanFeature.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    planID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'plans',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    features: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    isMandatory: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the plan is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'PlanFeature',
    tableName: 'plan_features',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ['deletedAt'] },
      where: { status: true },
    },
    scopes: {
      activePlanFeatures: { where: { status: true } },
    },
  }
);

export default PlanFeature;
