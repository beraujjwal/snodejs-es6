'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_audit_logs',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        tableName: {
          type: Sequelize.STRING(150),
          allowNull: false,
        },
        operation: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        recordID: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        changedFields: {
          type: Sequelize.TEXT('medium'),
          allowNull: false,
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

    // ✅ Add indexes separately
    await queryInterface.addIndex('gnrl_audit_logs', {
      fields: ['tableName'],
      name: 'idx_gnrl_audit_logs_table_name',
      transaction,
    });

    await queryInterface.addIndex('gnrl_audit_logs', {
      fields: ['operation'],
      name: 'idx_gnrl_audit_logs_operation',
      transaction,
    });

    await queryInterface.addIndex('gnrl_audit_logs', {
      fields: ['recordID'],
      name: 'idx_gnrl_audit_logs_record_id',
      transaction,
    });

    if (dbName === 'postgres') {
      await queryInterface.sequelize.query(
        `
          CREATE OR REPLACE FUNCTION fn_audit_logs()
          RETURNS TRIGGER AS $$
          DECLARE
            key TEXT;
            createdBy BIGINT;
            recordID BIGINT;
            diff JSONB := '{}'::jsonb;
            excluded_fields TEXT[] := ARRAY['createdAt', 'updatedAt', 'deletedAt', 'lastActivityBy'];  -- case-insensitive
          BEGIN
            IF TG_OP = 'INSERT' THEN
              diff := jsonb_build_object('new', to_jsonb(NEW) - excluded_fields);
              createdBy := COALESCE(OLD."lastActivityBy", 1);
              recordID := NEW.id;

            ELSIF TG_OP = 'DELETE' THEN
              diff := jsonb_build_object('old', to_jsonb(OLD) - excluded_fields);
              createdBy := COALESCE(OLD."lastActivityBy", 1);
              recordID := OLD.id;

            ELSIF TG_OP = 'UPDATE' THEN
              FOR key IN SELECT jsonb_object_keys(to_jsonb(NEW)) LOOP
                -- Skip excluded fields
                -- IF lower(key) = ANY (excluded_fields) THEN
                IF key = ANY (excluded_fields) THEN
                  CONTINUE;
                END IF;

                IF to_jsonb(NEW)->key IS DISTINCT FROM to_jsonb(OLD)->key THEN
                  diff := diff || jsonb_build_object(
                    key,
                    jsonb_build_object('old', to_jsonb(OLD)->key, 'new', to_jsonb(NEW)->key)
                  );
                END IF;
              END LOOP;
              createdBy := COALESCE(OLD."lastActivityBy", 1);
              recordID := OLD.id;
            END IF;

            INSERT INTO gnrl_audit_logs (
              "tableName",
              "operation",
              "recordID",
              "createdBy",
              "changedFields"
            ) VALUES (
              TG_TABLE_NAME,
              TG_OP,
              recordID,
              createdBy,
              diff
            );

            RETURN NULL;
          END;
          $$ LANGUAGE plpgsql;
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
      'gnrl_audit_logs',
      'idx_unique_gnrl_audit_logs_table_name',
      {
        transaction,
      }
    );
    await queryInterface.removeIndex(
      'gnrl_audit_logs',
      'idx_unique_gnrl_audit_logs_operation',
      {
        transaction,
      }
    );
    await queryInterface.removeIndex(
      'gnrl_audit_logs',
      'idx_unique_gnrl_audit_logs_record_id',
      {
        transaction,
      }
    );

    await queryInterface.sequelize.query(
      `DROP TRIGGER IF EXISTS alter_gnrl_audit_logs_on_delete;`,
      {
        transaction,
      }
    );
    if (dbName === 'postgres') {
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS fn_audit_logs();`,
        {
          transaction,
        }
      );
    }
    await queryInterface.dropTable('gnrl_audit_logs', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
