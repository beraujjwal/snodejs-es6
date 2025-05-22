'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';

class UserRole extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userID',
      as: 'user',
    });

    this.belongsTo(models.Role, {
      foreignKey: 'roleID',
      as: 'role',
    });
  }
}

UserRole.init(
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
    roleID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: {
          tableName: 'roles',
          modelName: 'Role',
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
      comment: 'This column is for checking if the user role is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'UserRole',
    tableName: 'user_roles',
    timestamps: true,
    paranoid: true,
    indexes: [{ unique: true, fields: ['userID', 'roleID'] }],
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
      where: {
        status: true,
      },
    },
    scopes: {
      activeUserRoles: {
        where: {
          status: true,
        },
      },
    },
  }
);

export default UserRole;
