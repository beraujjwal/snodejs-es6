'use strict';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';

class UserResourcePermission extends Model {
  static associate(models) {
    this.belongsTo(models.User, {
      foreignKey: 'userID',
      as: 'user',
    });

    this.belongsTo(models.Resource, {
      foreignKey: 'resourceID',
      as: 'resource',
    });

    this.belongsTo(models.Permission, {
      foreignKey: 'permissionID',
      as: 'permission',
    });
  }
}

UserResourcePermission.init(
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
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    resourceID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'resources',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    permissionID: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment:
        'This column is for checking if the user resource permission is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'UserResourcePermission',
    tableName: 'user_resource_permissions',
    timestamps: true,
    paranoid: true,
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
      where: {
        status: true,
      },
    },
    scopes: {
      activePermissions: {
        where: {
          status: true,
        },
      },
    },
  }
);

export default UserResourcePermission;
