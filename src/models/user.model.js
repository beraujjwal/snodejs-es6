'use strict';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';
import { BaseModel } from '../system/core/model/base.model.js';

const saltRounds = parseInt(process.env.SALT_FACTOR, 10);
const bucketName = process.env.AWS_S3_BUCKET_NAME;

class User extends BaseModel {
  static autoRegisterCommonHooks = false;
  static associate(models) {
    // User Roles Relationship
    this.belongsToMany(models.Role, {
      through: { model: 'UserRole', scope: { status: true } },
      as: 'roles',
      foreignKey: 'userID',
      otherKey: 'roleID',
    });

    // User Resource Relationship
    this.belongsToMany(models.Resource, {
      through: { model: 'UserResourcePermission', scope: { status: true } },
      foreignKey: 'userID',
      otherKey: 'resourceID',
      as: 'resources',
    });

    // User Tokens Relationship
    this.hasMany(models.Token, {
      as: 'tokens',
      foreignKey: 'userID',
    });

    // User Permissions Relationship
    this.belongsToMany(models.Permission, {
      through: {
        model: models.UserResourcePermission,
        scope: { status: true },
      },
      foreignKey: 'userID',
      otherKey: 'permissionID',
      as: 'userResourcePermissions',
    });

    // User Devices Relationship
    this.hasMany(models.UserDevice, {
      as: 'userDevices',
      foreignKey: 'userID',
    });

    this.hasOne(models.UserDevice, {
      as: 'userDevice',
      foreignKey: 'userID',
    });
  }

  // Hash password
  async generateHash(password) {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
  }

  // Validate password
  async validPassword(password) {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        is: {
          args: [/^[^0-9].*$/],
          msg: 'Slug cannot start with a number',
        },
      },
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        is: {
          args: [/^[^0-9].*$/],
          msg: 'Slug cannot start with a number',
        },
      },
    },
    ext: {
      type: DataTypes.STRING(5),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(75),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
        isLowercase: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        is: /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/i,
      },
    },
    loginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 5,
      },
    },
    blockExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indicates if the user registration is completed.',
    },
    image: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    thumbnail: {
      type: DataTypes.VIRTUAL,
      get() {
        if (this.image) {
          return `thumbnail/${this.image}`;
        }
        return false;
      },
      set(value) {
        throw new Error('Do not try to save this field.');
      },
    },
    path: {
      type: DataTypes.VIRTUAL,
      get() {
        if (this.image) {
          return `https://${bucketName}.s3.amazonaws.com/profile-images/`;
        }
        return false;
      },
      set(value) {
        throw new Error('Do not try to save this field.');
      },
    },
    timezone: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    verified: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: { email: true, phone: false },
      comment: 'Indicates if the user has verified their account.',
    },
    givenSMSConsent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indicates if the user given SMS consent .',
    },
    loginEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indicates if the user is able to login.',
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indicates if the user account is active.',
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'gnrl_users',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
    footprint: false, // Enables `lastActivityBy` for last user activity
    underscored: false, // Automatically maps createdAt → created_at
    defaultScope: {
      attributes: { exclude: ['deletedAt'] },
    },
    scopes: {
      active: { where: { status: true } },
      verified: { where: { status: true, verified: true } },
      isCompleted: { where: { status: true, isCompleted: true } },
    },
    indexes: [
      {
        type: 'FULLTEXT',
        name: 'idx_gnrl_user_full_name',
        fields: ['firstName', 'lastName'],
      },
      { name: 'idx_unique_gnrl_users_email', unique: true, fields: ['email'] },
      { name: 'idx_unique_gnrl_users_phone', unique: true, fields: ['phone'] },
      { name: 'idx_gnrl_user_status', fields: ['status'] },
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, saltRounds);
        }
      },
    },
  }
);

export default User;
