'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_user_devices',
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        userID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'gnrl_users',
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      {
        initialAutoIncrement: 1,
        engine: 'InnoDB', // (optional) ENGINE=InnoDB
        charset: 'utf8mb4', // (optional) DEFAULT CHARSET
        collate: 'utf8mb4_general_ci', // (optional) COLLATE
        transaction,
      }
    );
    if (dbName === 'mysql') {
      await queryInterface.addIndex('gnrl_user_devices', {
        fields: ['userID', 'deletedAt'],
        name: 'idx_gnrl_user_devices_user',
        transaction,
      });

      await queryInterface.addIndex('gnrl_user_devices', {
        fields: ['deviceType', 'deviceId', 'deviceSalt', 'deletedAt'],
        unique: true,
        name: 'idx_unique_gnrl_user_devices',
        transaction,
      });

      await queryInterface.addIndex('gnrl_user_devices', {
        fields: ['status', 'deletedAt'],
        name: 'idx_gnrl_user_devices_status',
        transaction,
      });
    } else if (dbName === 'postgres') {
      await queryInterface.addIndex('gnrl_user_devices', {
        fields: ['userID'],
        name: 'idx_gnrl_user_devices_user',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_user_devices', {
        fields: ['deviceType', 'deviceId', 'deviceSalt'],
        unique: true,
        name: 'idx_unique_gnrl_user_devices',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_user_devices', {
        fields: ['status'],
        name: 'idx_gnrl_user_devices_status',
        where: { deletedAt: null },
        transaction,
      });
    }
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.removeColumn(
      'gnrl_user_devices',
      'idx_unique_gnrl_user_devices_fks'
    );
    await queryInterface.dropTable('gnrl_user_devices', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
