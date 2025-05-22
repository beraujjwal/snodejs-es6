'use strict';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';
import slugify from 'slugify';

class Permission extends Model {
  static associate(models) {
    // Many-to-Many: Permission <-> Resource
    this.belongsToMany(models.Resource, {
      through: models.ResourcePermission,
      foreignKey: 'permissionID',
      otherKey: 'resourceID',
      as: 'permissionResources',
      constraints: true,
    });

    // Many-to-Many: Permission <-> Resource via RoleResourcePermission
    this.belongsToMany(models.Resource, {
      through: models.RoleResourcePermission,
      foreignKey: 'permissionID',
      otherKey: 'resourceID',
      as: 'permissionRoleResources',
      constraints: true,
    });

    // Many-to-Many: Permission <-> Role
    this.belongsToMany(models.Role, {
      through: models.RoleResourcePermission,
      foreignKey: 'permissionID',
      otherKey: 'roleID',
      as: 'permissionResourceRoles',
      constraints: true,
    });

    // Many-to-Many: Permission <-> User
    this.belongsToMany(models.User, {
      through: models.UserResourcePermission,
      foreignKey: 'permissionID',
      otherKey: 'userID',
      as: 'permissionResourceUsers',
      constraints: true,
    });

    // Many-to-Many: Permission <-> Resource via UserResourcePermission
    this.belongsToMany(models.Resource, {
      through: models.UserResourcePermission,
      foreignKey: 'permissionID',
      otherKey: 'resourceID',
      as: 'permissionUserResources',
      constraints: true,
    });
  }
}

Permission.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isLowercase: true,
      },
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment:
        'This column is for checking if the permission is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'Permission',
    tableName: 'permissions',
    timestamps: true,
    paranoid: true,
    indexes: [{ unique: true, fields: ['name', 'slug'] }],
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      }
    },
    hooks: {
      beforeValidate: (model) => {
        if (typeof model.name === 'string') {
          model.slug = slugify(model.name, { lower: true, strict: true });
        }
        if (model.status !== false) {
          model.status = true;
        }
      }
    },
    setterMethods: {
      name(value) {
        this.setDataValue('name', value.toString());
        this.setDataValue(
          'slug',
          slugify(value, { lower: true, strict: true })
        );
      },
    },
  }
);

export default Permission;
