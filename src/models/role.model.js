'use strict';
import slugify from 'slugify';
import { DataTypes, Model, Op } from 'sequelize';
import { sequelize } from '../system/core/db.connection.js';

class Role extends Model {
  static associate(models) {
    // Self-referencing relationship for parent roles
    this.belongsTo(this, {
      as: 'parent',
      foreignKey: 'parentID',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Many-to-Many with Users
    this.belongsToMany(models.User, {
      through: { model: 'UserRole', scope: { status: true } },
      as: 'users',
      foreignKey: 'roleID',
      otherKey: 'userID',
    });

    // Many-to-Many with Resources
    this.belongsToMany(models.Resource, {
      through: { model: 'RoleResourcePermission', scope: { status: true } },
      attributes: ['id', 'parentID', 'name', 'slug', 'status'],
      as: 'resources',
      foreignKey: 'roleID',
      otherKey: 'resourceID',
      auto: true,
    });

    // Many-to-Many with Permissions
    // this.belongsToMany(models.Permission, {
    //   through: { model: 'RoleResourcePermission', scope: { status: true } },
    //   attributes: ['id', 'name', 'slug', 'status'],
    //   as: 'permissions',
    //   foreignKey: 'roleID',
    //   otherKey: 'permissionID',
    // });
  }
}

Role.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    parentID: {
      type: DataTypes.BIGINT,
      allowNull: true, // Allow null for top-level roles
      references: {
        model: 'roles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      validate: {
        isInt: true,
        notIn: [[1, 2]],
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        //isAlpha: true,
        notIn: [['Super Admin', 'Admin']],
      },
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isLowercase: true,
        async isUnique(value) {
          const role = await Role.findOne({
            where: { slug: value, parentID: this.parentID },
          });
          if (role) {
            throw new Error('Role name already used.');
          }
        },
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'This column is for checking if the role is active or not.',
    },
  },
  {
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
    paranoid: true,
    indexes: [{ unique: true, fields: ['name', 'slug'] }],
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'],
      },
    },
    scopes: {
      withPermissions: {
        attributes: { exclude: ['createdAt'] },
      },
      activeRoles: {
        where: { status: true },
      },
      inActiveRoles: {
        where: { status: false },
      },
      parentRoles: {
        where: { parentID: { [Op.eq]: null } },
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

export default Role;
