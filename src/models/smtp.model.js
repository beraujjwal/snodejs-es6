'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class Smtp extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

Smtp.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        isIn: [['claim', 'move', 'user', 'agent', 'dbol', 'carrier', 'other']],
      },
    },
    host: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    port: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the resource is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'Smtp',
    tableName: 'gnrl_smtps',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
  }
);

export default Smtp;
