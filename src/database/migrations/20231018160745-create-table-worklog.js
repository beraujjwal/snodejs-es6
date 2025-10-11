'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_worklogs',
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
        module: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        action: {
          type: Sequelize.STRING(30),
          index: true,
          allowNull: false,
        },
        referenceID: {
          type: Sequelize.INTEGER,
          index: true,
          allowNull: true,
        },
        deviceId: {
          type: Sequelize.STRING(100),
          index: true,
          allowNull: true,
        },
        data: {
          type: dbName === 'postgres' ? Sequelize.JSONB : Sequelize.JSON,
          allowNull: true,
        },
        createdAt: {
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

    await queryInterface.addIndex('gnrl_worklogs', {
      fields: ['module'],
      name: 'idx_gnrl_worklogs_module',
      transaction,
    });
    await queryInterface.addIndex('gnrl_worklogs', {
      fields: ['action'],
      name: 'idx_gnrl_worklogs_action',
      transaction,
    });
    await queryInterface.addIndex('gnrl_worklogs', {
      fields: ['deviceId'],
      name: 'idx_gnrl_worklogs_device_id',
      transaction,
    });

    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  // const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.removeColumn('gnrl_worklogs', 'idx_gnrl_worklogs_module');
    await queryInterface.removeColumn('gnrl_worklogs', 'idx_gnrl_worklogs_action');
    await queryInterface.removeColumn('gnrl_worklogs', 'idx_gnrl_worklogs_device_id');
    await queryInterface.dropTable('gnrl_worklogs', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
