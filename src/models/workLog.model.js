'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class WorkLog extends BaseModel {
  // 🚫 No common hooks — logs don’t need slug/order/status
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userID',
      as: 'user',
    });
  }
}

WorkLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: {
          tableName: 'gnrl_users',
          modelName: 'User',
        },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    referenceID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deviceId: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    data: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the action was logged',
    },
  },
  {
    sequelize,
    modelName: 'WorkLog',
    tableName: 'gnrl_worklogs',
    timestamps: false, // Automatically adds `createdAt` and `updatedAt`
    paranoid: false, // Enables `deletedAt` for soft deletes
    indexes: [
      { fields: ['userID'] },
      { fields: ['module'] },
      { fields: ['action'] },
      { fields: ['referenceID'] },
    ],
  }
);

export default WorkLog;
