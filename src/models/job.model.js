'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class Job extends BaseModel {
  // ✅ Per-model configuration
  static autoRegisterCommonHooks = false;

  static associate(models) {}
}

Job.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    module: {
      type: DataTypes.ENUM(
        'carrier',
        'claim',
        'complaint',
        'dbol',
        'user',
        'other'
      ),
      allowNull: false,
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    data: {
      type:
        sequelize.options.dialect === 'postgres'
          ? DataTypes.JSONB
          : DataTypes.JSON,
      allowNull: true,
    },
    progressStatus: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 3,
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
    modelName: 'Job',
    tableName: 'gnrl_jobs',
    timestamps: true,
    paranoid: true,
    footprint: true,
    defaultScope: {
      where: {
        status: true,
      },
    },
    hooks: {
      beforeCreate: async (model) => {},
    },
  }
);

export default Job;
