'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';

class WorkLog extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

WorkLog.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    module: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    referenceId: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    deviceId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: {
          tableName: 'users',
          modelName: 'User',
        },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
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
    modelName: 'WorkLog',
    tableName: 'worklogs',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
  }
);

export default WorkLog;
