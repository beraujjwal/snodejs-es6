'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class UserSession extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    // User Devices Relationship
    this.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userID',
    });
  }
}

UserSession.init(
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
    clockIn: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    clockOut: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    duration: {
      type: DataTypes.TIME,
      allowNull: true,
      defaultValue: '00:00:00',
    },
    entreType: {
      type: DataTypes.ENUM('auto', 'manual'),
      allowNull: false,
      defaultValue: 'auto',
      comment:
        'This column is for checking if the user session is active or not.',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'UserSession',
    tableName: 'gnrl_user_sessiones',
    timestamps: false, // Automatically adds `createdAt` and `updatedAt`
    paranoid: false, // Enables `deletedAt` for soft deletes
    hooks: {
      beforeCreate: async (userSession, options) => {
        const now = new Date();
        userSession.createdDate = now;
        userSession.updatedDate = now;
      },
      beforeUpdate: async (userSession, options) => {
        const now = new Date();
        userSession.updatedDate = now;
      },
    },
  }
);

export default UserSession;
