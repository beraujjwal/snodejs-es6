'use strict';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { sequelize, DataTypes, Model } from '../system/core/db.connection.js';

const saltRounds = parseInt(process.env.SALT_FACTOR, 10);
const bucketName = process.env.AWS_S3_BUCKET_NAME;

class User extends Model {
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
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      unique: true,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
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
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    verified: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: { email: true, phone: false },
      comment: 'Indicates if the user has verified their account.',
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
    tableName: 'users',
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    paranoid: true, // Enables `deletedAt` for soft deletes
    indexes: [
      { type: 'FULLTEXT', name: 'user_name_idx', fields: ['name'] },
      { name: 'user_email_idx', unique: true, fields: ['email', 'deletedAt'] },
      { name: 'user_phone_idx', unique: true, fields: ['phone', 'deletedAt'] },
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
