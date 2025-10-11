'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';
//const dbName = process.env.DB_CONNECTION;

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_user_activities',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
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
        clockIn: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        clockOut: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        duration: {
          type: Sequelize.TIME,
          allowNull: true,
          defaultValue: '00:00:00',
        },
        entreType: {
          type: Sequelize.ENUM('auto', 'manual'),
          allowNull: false,
          defaultValue: 'auto',
          comment: 'This column is for checking if the user session is active or not.',
        },
        activityStatus: {
          type: Sequelize.ENUM('active', 'close', 'inactive', 'pending'),
          allowNull: false,
          defaultValue: 'active',
          comment: 'This column is for checking if the user session is active or not.',
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
      await queryInterface.addIndex('gnrl_user_activities', {
        fields: ['entreType', 'deletedAt'],
        name: 'idx_gnrl_user_activities_entre_type',
        transaction,
      });
      await queryInterface.addIndex('gnrl_user_activities', {
        fields: ['activityStatus', 'deletedAt'],
        name: 'idx_gnrl_user_activities_activity_status',
        transaction,
      });

      await queryInterface.addIndex('gnrl_user_activities', {
        fields: ['status', 'deletedAt'],
        name: 'idx_gnrl_user_activities_status',
        transaction,
      });
      await queryInterface.sequelize.query(
        `
          CREATE EVENT IF NOT EXISTS update_user_activity_to_expired_status
            ON SCHEDULE EVERY 1 MINUTE
            DO
              UPDATE gnrl_user_activities
              SET activityStatus = 'close'
              WHERE activityStatus != 'close'
                AND clockOut < NOW() - INTERVAL 5 MINUTE;
        `,
        { transaction }
      );
    } else if (dbName === 'postgres') {
      await queryInterface.addIndex('gnrl_user_activities', {
        fields: ['entreType'],
        name: 'idx_gnrl_user_activities_entre_type',
        where: { deletedAt: null },
        transaction,
      });
      await queryInterface.addIndex('gnrl_user_activities', {
        fields: ['activityStatus'],
        name: 'idx_gnrl_user_activities_activity_status',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_user_activities', {
        fields: ['status'],
        name: 'idx_gnrl_user_activities_status',
        where: { deletedAt: null },
        transaction,
      });
      // Assuming pg_cron is installed and configured
      // await queryInterface.sequelize.query(
      //   `
      //   SELECT cron.schedule(
      //     'update_user_activity_to_expired_status',
      //     '*/1 * * * *',
      //     $$
      //     UPDATE gnrl_user_activities
      //     SET "activityStatus" = 'close'
      //     WHERE "activityStatus" != 'close'
      //       AND "clockOut" < NOW() - INTERVAL '5 minutes'
      //     $$
      //   );
      //     `,
      //   { transaction }
      // );
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
      'gnrl_user_activities',
      'idx_gnrl_user_activities_entre_type'
    );
    await queryInterface.removeColumn(
      'gnrl_user_activities',
      'idx_gnrl_user_activities_activity_status'
    );
    if (dbName === 'mysql') {
      await queryInterface.sequelize.query(
        `DROP EVENT IF EXISTS update_user_activity_to_expired_status;`,
        {
          transaction,
        }
      );
    } else if (dbName === 'postgres') {
      await queryInterface.sequelize.query(`
        SELECT cron.unschedule('update_user_activity_to_expired_status');`);
    }
    await queryInterface.dropTable('gnrl_user_activities', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
