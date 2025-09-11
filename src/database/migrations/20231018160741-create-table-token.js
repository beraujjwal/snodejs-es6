'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_tokens',
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
        token: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        sentTo: {
          type: Sequelize.ENUM('email', 'push', 'sms', 'whatsapp', 'other'), //Sequelize.STRING,
          index: true,
          allowNull: false,
          defaultValue: 'email',
        },
        sentOn: {
          type: Sequelize.STRING,
          index: true,
          allowNull: false,
        },
        sentFor: {
          type: Sequelize.ENUM(
            'activation',
            'consent',
            'forgot_password',
            'password_reset',
            'other'
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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

    // Add indexes
    await queryInterface.addIndex('gnrl_tokens', {
      fields: ['sentTo'],
      name: 'idx_gnrl_tokens_sent_to',
      transaction,
    });

    await queryInterface.addIndex('gnrl_tokens', {
      fields: ['sentOn'],
      name: 'idx_gnrl_tokens_sent_on',
      transaction,
    });

    await queryInterface.addIndex('gnrl_tokens', {
      fields: ['sentFor'],
      name: 'idx_gnrl_tokens_sent_for',
      transaction,
    });

    await queryInterface.addIndex('gnrl_tokens', {
      fields: ['status'],
      name: 'idx_gnrl_tokens_status',
      transaction,
    });

    if (dbName === 'mysql') {
      await queryInterface.sequelize.query(
        `CREATE EVENT daily_token_cleanup
              ON SCHEDULE AT CURRENT_TIMESTAMP + INTERVAL 1 DAY
              DO
              DELETE FROM gnrl_tokens WHERE status = false AND createdAt < DATE_SUB(NOW(), INTERVAL 2 DAY);`,
        { transaction }
      );
    } else if (dbName === 'postgres') {
      await queryInterface.sequelize.query(
        `
        SELECT cron.schedule(
          'daily_token_cleanup',
          '0 0 * * *',
          $$DELETE FROM gnrl_tokens WHERE status = false AND "createdAt" < NOW() - INTERVAL '2 days'$$
        );
          `,
        { transaction }
      );
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
    await queryInterface.removeIndex('gnrl_tokens', 'idx_gnrl_tokens_sent_to', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_tokens', 'idx_gnrl_tokens_sent_on', {
      transaction,
    });
    await queryInterface.removeIndex(
      'gnrl_tokens',
      'idx_gnrl_tokens_sent_for',
      {
        transaction,
      }
    );

    if (dbName === 'mysql') {
      await queryInterface.sequelize.query(
        `DROP EVENT IF EXISTS daily_token_cleanup`
      );
    } else if (dbName === 'postgres') {
      await queryInterface.sequelize.query(`
        SELECT cron.unschedule('daily_token_cleanup');`);
    }
    await queryInterface.dropTable('gnrl_tokens', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
