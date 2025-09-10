'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class UserDevice extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    // User Devices Relationship
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userID',
    });
  }
}

UserDevice.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
      allowNull: false,
    },
    userID: {
      type: DataTypes.INTEGER,
      required: true,
      index: true,
      references: {
        model: {
          tableName: 'gnrl_users',
          modelName: 'User',
        },
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    userToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fcmToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    deviceId: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    deviceType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    deviceSalt: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    ip: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isValidIP(value) {
          return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(
            value
          );
        },
      },
    },
    os: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    browser: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    address: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    latitude: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'UserDevice',
    tableName: 'gnrl_user_devices',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
  }
);

export default UserDevice;
