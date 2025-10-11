'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_timezones',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        code: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false,
        },
        utc: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        gmt: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        isDST: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        dstStartMonth: {
          type: Sequelize.STRING(10),
          defaultValue: null,
          allowNull: true,
        },
        dstStartWeek: {
          type: Sequelize.INTEGER,
          defaultValue: null,
          allowNull: true,
        },
        dstStartDay: {
          type: Sequelize.STRING(10),
          defaultValue: null,
          allowNull: true,
        },
        dstStartTime: {
          type: Sequelize.TIME,
          defaultValue: null,
          allowNull: true,
        },
        dstEndMonth: {
          type: Sequelize.STRING(10),
          defaultValue: null,
          allowNull: true,
        },
        dstEndWeek: {
          type: Sequelize.INTEGER,
          defaultValue: null,
          allowNull: true,
        },
        dstEndDay: {
          type: Sequelize.STRING(10),
          defaultValue: null,
          allowNull: true,
        },
        dstEndTime: {
          type: Sequelize.TIME,
          defaultValue: null,
          allowNull: true,
        },
        shift: {
          type: Sequelize.INTEGER,
          defaultValue: null,
          allowNull: true,
        },
        order: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
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
      // Add indexes
      await queryInterface.addIndex('gnrl_timezones', {
        fields: ['name', 'deletedAt'],
        name: 'idx_gnrl_timezones_name',
        transaction,
      });

      await queryInterface.addIndex('gnrl_timezones', {
        fields: ['code', 'deletedAt'],
        unique: true,
        name: 'idx_unique_gnrl_timezones_code',
        transaction,
      });

      await queryInterface.addIndex('gnrl_timezones', {
        fields: ['utc', 'deletedAt'],
        name: 'idx_gnrl_timezones_utc',
        transaction,
      });

      await queryInterface.addIndex('gnrl_timezones', {
        fields: ['status', 'deletedAt'],
        name: 'idx_gnrl_timezones_status',
        transaction,
      });
      await queryInterface.sequelize.query(
        `
          CREATE TRIGGER alter_gnrl_timezones_on_delete
            BEFORE UPDATE ON gnrl_timezones
            FOR EACH ROW
            BEGIN
            IF NEW.deletedAt IS NOT NULL AND OLD.deletedAt IS NULL THEN
              SET NEW.code = CONCAT(OLD.code, '-', OLD.id);
            END IF;
          END
        `,
        { transaction }
      );
    } else if (dbName === 'postgres') {
      // Add indexes
      await queryInterface.addIndex('gnrl_timezones', {
        fields: ['name'],
        name: 'idx_gnrl_timezones_name',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_timezones', {
        fields: ['code'],
        unique: true,
        name: 'idx_unique_gnrl_timezones_code',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_timezones', {
        fields: ['utc'],
        name: 'idx_gnrl_timezones_utc',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_timezones', {
        fields: ['status'],
        name: 'idx_gnrl_timezones_status',
        where: { deletedAt: null },
        transaction,
      });
      await queryInterface.sequelize.query(
        `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_logs_for_timezones'
            ) THEN
              CREATE TRIGGER trg_audit_logs_for_timezones
              AFTER INSERT OR UPDATE OR DELETE ON gnrl_timezones
              FOR EACH ROW
              EXECUTE FUNCTION fn_audit_logs();
            END IF;
          END;
          $$;
        `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
        CREATE OR REPLACE FUNCTION alter_gnrl_timezones_on_delete_fn()
        RETURNS trigger AS $$
        BEGIN
          IF NEW."deletedAt" IS NOT NULL THEN
            NEW.code := OLD.code || '-' || OLD.id;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
          `,
        { transaction }
      );
      await queryInterface.sequelize.query(
        `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_trigger WHERE tgname = 'alter_gnrl_timezones_on_delete'
          ) THEN
            CREATE TRIGGER alter_gnrl_timezones_on_delete
            BEFORE UPDATE ON gnrl_timezones
            FOR EACH ROW
            WHEN (OLD."deletedAt" IS DISTINCT FROM NEW."deletedAt")
            EXECUTE FUNCTION alter_gnrl_timezones_on_delete_fn();
          END IF;
        END;
        $$;
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
    await queryInterface.removeIndex('gnrl_timezones', 'idx_gnrl_timezones_name', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_timezones', 'idx_unique_gnrl_timezones_code', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_timezones', 'idx_gnrl_timezones_utc', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_timezones', 'idx_gnrl_timezones_status', {
      transaction,
    });
    if (dbName === 'mysql') {
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS alter_gnrl_timezones_on_delete;`,
        {
          transaction,
        }
      );
    } else if (dbName === 'postgres') {
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS trg_audit_logs_for_timezones ON gnrl_timezones;`,
        {
          transaction,
        }
      );
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS alter_gnrl_timezones_on_delete ON gnrl_timezones;`,
        {
          transaction,
        }
      );
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS alter_gnrl_timezones_on_delete_fn();`,
        {
          transaction,
        }
      );
    }
    await queryInterface.dropTable('gnrl_timezones', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
