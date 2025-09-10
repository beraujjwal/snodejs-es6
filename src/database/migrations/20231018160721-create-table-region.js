'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_regions',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        slug: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },
        name: {
          type: Sequelize.STRING(100),
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
      await queryInterface.addIndex('gnrl_regions', {
        fields: ['slug', 'deletedAt'],
        unique: true,
        name: 'idx_unique_gnrl_regions_slug',
        transaction,
      });

      await queryInterface.addIndex('gnrl_regions', {
        fields: ['name'],
        name: 'idx_gnrl_regions_name',
        transaction,
      });

      await queryInterface.addIndex('gnrl_regions', {
        fields: ['status', 'deletedAt'],
        name: 'idx_gnrl_regions_status',
        transaction,
      });
      await queryInterface.sequelize.query(
        `
        CREATE TRIGGER alter_gnrl_regions_on_delete
        BEFORE UPDATE ON gnrl_regions
        FOR EACH ROW
        BEGIN
          IF NEW.deletedAt IS NOT NULL AND OLD.deletedAt IS NULL THEN
            SET NEW.slug = CONCAT(OLD.slug, '-', OLD.id);
          END IF;
        END
        `,
        { transaction }
      );
    } else if (dbName === 'postgres') {
      // Add indexes
      await queryInterface.addIndex('gnrl_regions', {
        fields: ['slug'],
        unique: true,
        name: 'idx_unique_gnrl_regions_slug',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_regions', {
        fields: ['name'],
        name: 'idx_gnrl_regions_name',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_regions', {
        fields: ['status'],
        name: 'idx_gnrl_regions_status',
        where: { deletedAt: null },
        transaction,
      });
      await queryInterface.sequelize.query(
        `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_logs_for_regions'
            ) THEN
              CREATE TRIGGER trg_audit_logs_for_regions
              AFTER INSERT OR UPDATE OR DELETE ON gnrl_regions
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
        CREATE OR REPLACE FUNCTION alter_gnrl_regions_on_delete_fn()
        RETURNS trigger AS $$
        BEGIN
          IF NEW."deletedAt" IS NOT NULL THEN
            NEW."slug" := OLD."slug" || '-' || OLD."id";
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
            SELECT 1 FROM pg_trigger WHERE tgname = 'alter_gnrl_regions_on_delete'
          ) THEN
            CREATE TRIGGER alter_gnrl_regions_on_delete
            BEFORE UPDATE ON gnrl_regions
            FOR EACH ROW
            WHEN (OLD."deletedAt" IS DISTINCT FROM NEW."deletedAt")
            EXECUTE FUNCTION alter_gnrl_regions_on_delete_fn();
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
    await queryInterface.removeIndex(
      'gnrl_regions',
      'idx_unique_gnrl_regions_slug',
      {
        transaction,
      }
    );
    await queryInterface.removeIndex('gnrl_regions', 'idx_gnrl_regions_name', {
      transaction,
    });
    await queryInterface.removeIndex(
      'gnrl_regions',
      'idx_gnrl_regions_status',
      {
        transaction,
      }
    );
    if (dbName === 'mysql') {
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS alter_gnrl_regions_on_delete;`,
        {
          transaction,
        }
      );
    } else if (dbName === 'postgres') {
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS trg_audit_logs_for_gnrl_regions ON gnrl_regions;`,
        {
          transaction,
        }
      );

      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS alter_gnrl_regions_on_delete ON gnrl_regions;`,
        {
          transaction,
        }
      );
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS alter_gnrl_regions_on_delete_fn();`,
        {
          transaction,
        }
      );
    }

    await queryInterface.dropTable('gnrl_regions', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
