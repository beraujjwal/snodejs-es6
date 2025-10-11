'use strict';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'acl_roles',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        parentID: {
          type: Sequelize.INTEGER,
          references: {
            model: 'acl_roles',
            key: 'id',
          },
          allowNull: true,
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        name: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT('medium'),
          allowNull: true,
        },
        status: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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
      await queryInterface.addIndex('acl_roles', {
        fields: ['name', 'deletedAt'],
        name: 'idx_acl_roles_name',
        transaction,
      });

      await queryInterface.addIndex('acl_roles', {
        fields: ['slug', 'deletedAt'],
        unique: true,
        name: 'idx_unique_acl_roles_slug',
        transaction,
      });

      await queryInterface.addIndex('acl_roles', {
        fields: ['status', 'deletedAt'],
        name: 'idx_acl_roles_status',
        transaction,
      });
      await queryInterface.sequelize.query(
        `
                CREATE TRIGGER IF NOT EXISTS alter_acl_roles_slug_on_delete
                  BEFORE UPDATE ON acl_roles
                  FOR EACH ROW
                    BEGIN
                    IF NEW.deletedAt IS NOT NULL AND OLD.deletedAt IS NULL THEN
                      SET NEW.slug = CONCAT(OLD.slug, '-', OLD.id);
                      END IF;
                END;`,
        { transaction }
      );
    } else if (dbName === 'postgres') {
      // Add indexes
      await queryInterface.addIndex('acl_roles', {
        fields: ['name'],
        name: 'idx_acl_roles_name',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('acl_roles', {
        fields: ['slug'],
        unique: true,
        name: 'idx_unique_acl_roles_slug',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('acl_roles', {
        fields: ['status'],
        name: 'idx_acl_roles_status',
        where: { deletedAt: null },
        transaction,
      });
      await queryInterface.sequelize.query(
        `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_logs_for_roles'
            ) THEN
              CREATE TRIGGER trg_audit_logs_for_roles
              AFTER INSERT OR UPDATE OR DELETE ON acl_roles
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
            CREATE OR REPLACE FUNCTION alter_acl_roles_slug_on_delete_fn()
            RETURNS trigger AS $$
            BEGIN
              IF NEW."deletedAt" IS NOT NULL THEN
                NEW.slug := OLD.slug || '-' || OLD.id;
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
                SELECT 1 FROM pg_trigger WHERE tgname = 'alter_acl_roles_slug_on_delete'
              ) THEN
                CREATE TRIGGER alter_acl_roles_slug_on_delete
                BEFORE UPDATE ON acl_roles
                FOR EACH ROW
                WHEN (OLD."deletedAt" IS DISTINCT FROM NEW."deletedAt")
                EXECUTE FUNCTION alter_acl_roles_slug_on_delete_fn();
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
    await queryInterface.removeIndex('acl_roles', 'idx_unique_acl_roles_slug', {
      transaction,
    });
    await queryInterface.removeIndex('acl_roles', 'idx_acl_roles_name', {
      transaction,
    });
    if (dbName === 'mysql') {
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS alter_acl_roles_slug_on_delete`);
    } else if (dbName === 'postgres') {
      await queryInterface.sequelize.query(
        `
            DROP TRIGGER IF EXISTS alter_acl_roles_slug_on_delete ON acl_roles;
            DROP FUNCTION IF EXISTS alter_acl_roles_slug_on_delete_fn();
          `
      );
    }
    await queryInterface.dropTable('acl_roles', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
