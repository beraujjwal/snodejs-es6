'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class Tenant extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userID',
      as: 'user',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
}

Tenant.init(
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
      onDelete: 'RESTRICT',
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    organization: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    db_username: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    db_password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the timezone is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'Tenant',
    tableName: 'tenants',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: { exclude: ['deletedAt'] },
    },
    scopes: {
      activeTimezones: { where: { status: true } },
    },
  }
);

export default Tenant;
