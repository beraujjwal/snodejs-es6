'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.BIGINT,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    first_name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    last_name: {
      type: Sequelize.STRING(100),
      allowNull: false,
    },
    ext: {
      type: Sequelize.STRING(5),
      allowNull: false,
    },
    phone: {
      type: Sequelize.STRING(15),
      unique: true,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING(100),
      unique: true,
      allowNull: true,
    },
    password: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    loginAttempts: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    blockExpires: {
      type: Sequelize.DATE,
      allowNull: true,
    },
    isCompleted: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    timezone: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    verified: {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: { email: true, phone: false },
      comment: 'Indicates if the user has verified their account.',
    },
    image: {
      type: Sequelize.STRING(100),
      allowNull: true,
    },
    status: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    deletedAt: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });

  await queryInterface.addIndex('users', ['first_name', 'last_name']);

  await queryInterface.addIndex('users', {
    fields: ['email', 'deletedAt'],
    unique: true,
    name: 'unique_users_email',
  });

  await queryInterface.addIndex('users', {
    fields: ['phone', 'deletedAt'],
    unique: true,
    name: 'unique_users_phone',
  });
}
async function down({ context: queryInterface }) {
  await queryInterface.dropTable('users');
}

export { up, down };
