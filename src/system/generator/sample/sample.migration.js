'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';
//const dbName = process.env.DB_CONNECTION;

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'TABLE_NAME_PLURAL_FORM',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        // field: {
        //   type: Sequelize.datatype,
        //   allowNull: true,
        // },
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
      { transaction }
    );

    /*if (dbName === 'mysql') {
      await queryInterface.sequelize.query(
        `
          CREATE TRIGGER IF NOT EXISTS alter_TABLE_NAME_PLURAL_FORM_on_delete
            BEFORE UPDATE ON TABLE_NAME_PLURAL_FORM
            FOR EACH ROW
            BEGIN
            IF NEW."deletedAt" IS NOT NULL THEN
              SET NEW."slug" = CONCAT(OLD."slug", '-', OLD."id");
            END IF;
          END;
        `,
        { transaction }
      );
    } else {
      await queryInterface.sequelize.query(
        `
        CREATE OR REPLACE FUNCTION alter_TABLE_NAME_PLURAL_FORM_on_delete_fn()
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
            SELECT 1 FROM pg_trigger WHERE tgname = 'alter_TABLE_NAME_PLURAL_FORM_on_delete'
          ) THEN
            CREATE TRIGGER alter_TABLE_NAME_PLURAL_FORM_on_delete
            BEFORE UPDATE ON TABLE_NAME_PLURAL_FORM
            FOR EACH ROW
            EXECUTE FUNCTION alter_TABLE_NAME_PLURAL_FORM_on_delete_fn();
          END IF;
        END;
        $$;
          `,
        { transaction }
      );
      }*/

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
    /*if (dbName === 'mysql') {
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS alter_TABLE_NAME_PLURAL_FORM_on_delete;`,
        {
          transaction,
        }
      );
    } else {
      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS alter_TABLE_NAME_PLURAL_FORM_on_delete ON TABLE_NAME_PLURAL_FORM;`,
        {
          transaction,
        }
      );
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS alter_TABLE_NAME_PLURAL_FORM_on_delete_fn();`,
        {
          transaction,
        }
      );
      }*/
    await queryInterface.dropTable('TABLE_NAME_PLURAL_FORM', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
