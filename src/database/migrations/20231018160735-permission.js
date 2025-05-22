'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';
const dbName = process.env.DB_CONNECTION;

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  try {
    await queryInterface.createTable(
      'permissions',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        name: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false,
        },
        slug: {
          type: Sequelize.STRING(50),
          unique: true,
          allowNull: false,
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
          defaultValue: Sequelize.NOW,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      },
      { transaction }
    );
    if (dbName === 'mysql') {
      await queryInterface.sequelize.query(
        `
            CREATE TRIGGER IF NOT EXISTS alter_permissions_slug_on_delete
              BEFORE UPDATE ON permissions
              FOR EACH ROW
                BEGIN
                  IF NEW.deletedAt != null THEN
                    SET NEW.slug = CONCAT(OLD.slug, '-', OLD.id);
                  END IF;
            END;`,
        { transaction }
      );
    } else {
      await queryInterface.sequelize.query(
        `
        CREATE OR REPLACE FUNCTION alter_permissions_slug_on_delete_fn()
        RETURNS trigger AS $$
        BEGIN
          IF NEW.deletedAt IS NOT NULL THEN
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
            SELECT 1 FROM pg_trigger WHERE tgname = 'alter_permissions_slug_on_delete'
          ) THEN
            CREATE TRIGGER alter_permissions_slug_on_delete
            BEFORE UPDATE ON permissions
            FOR EACH ROW
            EXECUTE FUNCTION alter_permissions_slug_on_delete_fn();
          END IF;
        END;
        $$;
          `,
        { transaction }
      );
    }

    await queryInterface.addIndex('permissions', ['name', 'slug'], {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

async function down({ context: queryInterface }) {
  try {
    if (dbName === 'mysql') {
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS alter_permissions_slug_on_delete`
      );
    } else {
      await queryInterface.sequelize.query(
        `
            DROP TRIGGER IF EXISTS alter_permissions_slug_on_delete ON permissions;
            DROP FUNCTION IF EXISTS alter_permissions_slug_on_delete_fn();
          `
      );
    }
    await queryInterface.dropTable('permissions');
  } catch (ex) {
    throw ex;
  }
}

export { up, down };
