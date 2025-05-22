'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  await queryInterface
    .createTable('user_devices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      userID: {
        type: Sequelize.BIGINT,
        references: {
          model: 'users',
          key: 'id',
        },
        allowNull: false,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      userToken: {
        type: Sequelize.STRING(700),
        allowNull: true,
      },
      fcmToken: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      deviceId: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      deviceType: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      deviceSalt: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      ip: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      os: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      browser: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      address: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      zipCode: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      latitude: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      cryptoSecretKey: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      cryptoIvPassphrase: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
    })
    .then(() =>
      queryInterface.addIndex('user_devices', ['deviceId', 'userID'])
    );
}

async function down({ context: queryInterface }) {
  await queryInterface.dropTable('user_devices');
}

export { up, down };
