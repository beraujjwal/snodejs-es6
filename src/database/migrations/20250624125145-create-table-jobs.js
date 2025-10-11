'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_jobs',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        module: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        source: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        type: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        data: {
          type: dbName === 'postgres' ? Sequelize.JSONB : Sequelize.JSON,
          allowNull: true,
        },
        progressStatus: {
          type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
          allowNull: false,
        },
        attempts: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        maxAttempts: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 3,
        },
        status: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
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
      // ✅ Add indexes separately
      await queryInterface.addIndex('gnrl_jobs', {
        fields: ['module', 'status'],
        name: 'idx_gnrl_jobs_module',
        transaction,
      });

      await queryInterface.addIndex('gnrl_jobs', {
        fields: ['source', 'status'],
        name: 'idx_gnrl_jobs_source',
        transaction,
      });

      await queryInterface.addIndex('gnrl_jobs', {
        fields: ['type', 'status'],
        name: 'idx_gnrl_jobs_type',
        transaction,
      });
    } else if (dbName === 'postgres') {
      // ✅ Add indexes separately
      await queryInterface.addIndex('gnrl_jobs', {
        fields: ['module'],
        name: 'idx_gnrl_jobs_module',
        where: { status: true }, // partial index
        transaction,
      });

      await queryInterface.addIndex('gnrl_jobs', {
        fields: ['source'],
        name: 'idx_gnrl_jobs_source',
        where: { status: true }, // partial index
        transaction,
      });

      await queryInterface.addIndex('gnrl_jobs', {
        fields: ['module'],
        name: 'idx_gnrl_jobs_type',
        where: { status: true }, // partial index
        transaction,
      });

      await queryInterface.addIndex('gnrl_jobs', {
        name: 'idx_gnrl_jobs_data_gin',
        fields: ['data'],
        using: 'GIN',
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
    await queryInterface.removeIndex('gnrl_jobs', 'idx_gnrl_jobs_module', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_jobs', 'idx_gnrl_jobs_source', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_jobs', 'idx_gnrl_jobs_type', {
      transaction,
    });
    if (dbName === 'postgres') {
      await queryInterface.removeIndex('gnrl_jobs', 'idx_gnrl_jobs_data_gin', {
        transaction,
      });
    }
    await queryInterface.dropTable('gnrl_jobs', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
