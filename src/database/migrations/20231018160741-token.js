'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';
const dbName = process.env.DB_CONNECTION;

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.createTable(
      'tokens',
      {
        id: {
          type: Sequelize.BIGINT,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
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
        token: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        sentTo: {
          type: Sequelize.ENUM('EMAIL', 'OTHER', 'PHONE'), //Sequelize.STRING,
          index: true,
          allowNull: false,
        },
        sentOn: {
          type: Sequelize.STRING,
          index: true,
          allowNull: false,
        },
        sentFor: {
          type: Sequelize.ENUM(
            'ACTIVATION',
            'FORGOT_PASSWORD',
            'OTHER',
            'RESET_PASSWORD'
          ), //Sequelize.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        expireAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      { transaction }
    );
    if (dbName === 'mysql') {
      await queryInterface.sequelize.query(
        `CREATE EVENT expire_token
              ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 1 DAY
              DO
              DELETE FROM tokens WHERE createdAt < DATE_SUB(NOW(), INTERVAL 2 DAY);`,
        { transaction }
      );
    } else if (dbName === 'postgres') {
      await queryInterface.sequelize.query(
        `SELECT cron.schedule(
            'daily_token_cleanup',  -- Job name
            '0 0 * * *',            -- Cron schedule (daily at midnight)
            $$DELETE FROM tokens WHERE status = false AND createdAt < NOW() - INTERVAL '2 days';$$
          );`,
        { transaction }
      );
    }

    await queryInterface.addIndex(
      'tokens',
      ['userID', 'sentTo', 'sentOn', 'sentFor'],
      { transaction }
    );
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  try {
    if (dbName === 'mysql') {
      await queryInterface.sequelize.query(`DROP EVENT IF EXISTS expire_token`);
    } else if (dbName === 'postgres') {
      await queryInterface.sequelize.query(
        `
            SELECT cron.unschedule('daily_token_cleanup');
          `
      );
    }
    await queryInterface.dropTable('tokens');
  } catch (ex) {
    throw ex;
  }
}

export { up, down };
