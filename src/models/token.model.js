'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

class Token extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userID',
      as: 'user',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

Token.init(
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
      onDelete: 'CASCADE',
    },
    token: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    sentTo: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [['email', 'push', 'sms', 'whatsapp', 'other']],
      },
      index: true,
      allowNull: false,
      defaultValue: 'email',
    },
    sentOn: {
      type: DataTypes.STRING(100),
      index: true,
      allowNull: false,
    },
    sentFor: {
      type: DataTypes.STRING(20),
      validate: {
        isIn: [
          [
            'activation',
            'claim',
            'consent',
            'forgot_password',
            'password_reset',
            'other',
          ],
        ],
      },
      allowNull: false,
    },
    // sentTo: {
    //   type: DataTypes.ENUM('EMAIL', 'PHONE'),
    //   allowNull: false,
    //   defaultValue: 'PHONE',
    // },
    // sentOn: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    // },
    // sentFor: {
    //   type: DataTypes.ENUM('ACTIVATION', 'FORGOT_PASSWORD', 'RESET_PASSWORD'),
    //   allowNull: false,
    //   defaultValue: 'ACTIVATION',
    // },
    expireAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the token is active or not.',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Token',
    tableName: 'gnrl_tokens',
    timestamps: false, // Automatically adds `createdAt` and `updatedAt`
    paranoid: false, // Enables `deletedAt` for soft deletes
    footprint: false, // Enables `lastActivityBy` for last user activity
  }
);

export default Token;
