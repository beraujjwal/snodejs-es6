'use strict';
import slugify from 'slugify';
import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class Resource extends Model {
  static associate(models) {
    // Self-referencing associations (Parent-Child)
    this.hasMany(this, {
      as: 'children',
      foreignKey: 'parentID',
      attributes: ['id', 'parentID', 'name', 'slug', 'status'],
    });

    this.belongsTo(this, {
      as: 'parent',
      foreignKey: 'parentID',
      required: false,
      attributes: ['id', 'parentID', 'name', 'slug', 'status'],
      auto: true,
    });

    // Many-to-Many Relations
    this.belongsToMany(models.Permission, {
      through: {
        model: models.ResourcePermission,
        sourceKey: 'permissionID',
        scope: {
          status: true,
          deletedAt: null,
        },
        attributes: [],
      },
      foreignKey: 'resourceID',
      otherKey: 'permissionID',
      as: 'resourcePermissions',
      required: false,
      attributes: ['id', 'name', 'slug', 'status'],
      auto: true,
    });

    this.belongsToMany(models.Permission, {
      through: {
        model: models.RoleResourcePermission,
        sourceKey: 'permissionID',
        scope: {
          status: true,
        },
        attributes: [],
      },
      foreignKey: 'resourceID',
      otherKey: 'permissionID',
      as: 'resourceRolePermissions',
    });

    this.belongsToMany(models.Role, {
      through: models.RoleResourcePermission,
      foreignKey: 'resourceID',
      otherKey: 'roleID',
      as: 'resourcePermissionRoles',
    });

    this.belongsToMany(models.Permission, {
      through: models.UserResourcePermission,
      foreignKey: 'resourceID',
      otherKey: 'permissionID',
      as: 'resourceUserPermissions',
    });

    this.belongsToMany(models.User, {
      through: models.UserResourcePermission,
      foreignKey: 'resourceID',
      otherKey: 'userID',
      as: 'resourcePermissionUsers',
    });

    this.belongsToMany(models.Menu, {
      through: models.MenuResource,
      foreignKey: 'resourceID',
      otherKey: 'menuID',
      as: 'resourceMenus',
    });
  }
}

Resource.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    parentID: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'resources',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
        async isUnique(value) {
          const resource = await Resource.findOne({ where: { slug: value } });
          if (resource) {
            throw new Error('Resource name already used.');
          }
        },
      },
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
    modelName: 'Resource',
    tableName: 'resources',
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
    hooks: {
      beforeValidate: (model) => {
        if (typeof model.name === 'string') {
          model.slug = slugify(model.name, { lower: true, strict: true });
        }
        if (model.status !== false) {
          model.status = true;
        }
      },
    },
  }
);

export default Resource;
