'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';
//const dbName = process.env.DB_CONNECTION;

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_smtps',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        type: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        host: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        port: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        username: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(60),
          allowNull: false,
        },
        status: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        lastActivityBy: {
          type: Sequelize.INTEGER,
          references: {
            model: 'gnrl_users',
            key: 'id',
          },
          allowNull: false,
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
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
      // ✅ Add indexes separately
      await queryInterface.addIndex('gnrl_smtps', {
        fields: ['type', 'status', 'deletedAt'],
        name: 'idx_gnrl_smtps_type',
        transaction,
      });

      await queryInterface.addIndex('gnrl_smtps', {
        fields: ['host', 'status', 'deletedAt'],
        name: 'idx_gnrl_smtps_host',
        transaction,
      });

      await queryInterface.addIndex('gnrl_smtps', {
        fields: ['username', 'status', 'deletedAt'],
        name: 'idx_gnrl_smtps_username',
        transaction,
      });
    } else if (dbName === 'postgres') {
      // ✅ Add indexes separately
      await queryInterface.addIndex('gnrl_smtps', {
        fields: ['type'],
        name: 'idx_gnrl_smtps_type',
        where: { deletedAt: null, status: true }, // partial index
        transaction,
      });

      await queryInterface.addIndex('gnrl_smtps', {
        fields: ['host'],
        name: 'idx_gnrl_smtps_host',
        where: { deletedAt: null, status: true }, // partial index
        transaction,
      });

      await queryInterface.addIndex('gnrl_smtps', {
        fields: ['username'],
        name: 'idx_gnrl_smtps_username',
        where: { deletedAt: null, status: true }, // partial index
        transaction,
      });

      await queryInterface.sequelize.query(
        `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_logs_for_gnrl_smtps'
            ) THEN
              CREATE TRIGGER trg_audit_logs_for_gnrl_smtps
              AFTER INSERT OR UPDATE OR DELETE ON gnrl_smtps
              FOR EACH ROW
              EXECUTE FUNCTION fn_audit_logs();
            END IF;
          END;
          $$;
        `,
        { transaction }
      );
    }

    await transaction.commit();
  } catch (ex) {
    console.error(ex);
    await transaction.rollback();
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.removeIndex('gnrl_smtps', 'idx_gnrl_smtps_type', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_smtps', 'idx_gnrl_smtps_host', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_smtps', 'idx_gnrl_smtps_username', {
      transaction,
    });
    if (dbName === 'mysql') {
      // Noting to do for now
    } else if (dbName === 'postgres') {
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS trg_audit_logs_for_gnrl_smtps ON gnrl_smtps;`,
        {
          transaction,
        }
      );
    }
    await queryInterface.dropTable('gnrl_smtps', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
