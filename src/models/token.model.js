'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class Token extends Model {
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
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    userID: {
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
      onDelete: 'CASCADE',
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sentTo: {
      type: DataTypes.ENUM('EMAIL', 'PHONE'),
      allowNull: false,
      defaultValue: 'PHONE',
    },
    sentOn: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sentFor: {
      type: DataTypes.ENUM('ACTIVATION', 'FORGOT_PASSWORD', 'RESET_PASSWORD'),
      allowNull: false,
      defaultValue: 'ACTIVATION',
    },
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
    tableName: 'tokens',
    timestamps: false, // This automatically adds `createdAt` & `updatedAt`
    paranoid: false, // Enables `deletedAt` for soft deletes
  }
);

export default Token;
