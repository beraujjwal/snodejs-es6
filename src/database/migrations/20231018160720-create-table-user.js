'use strict';
import 'dotenv/config';
import { Sequelize } from 'sequelize';

async function up({ context: queryInterface }) {
  const transaction = await queryInterface.sequelize.transaction();
  const dbName = queryInterface.sequelize.getDialect();
  try {
    await queryInterface.createTable(
      'gnrl_users',
      {
        id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        firstName: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        lastName: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        ext: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        phone: {
          type: Sequelize.STRING(15),
          unique: true,
          allowNull: true,
        },
        email: {
          type: Sequelize.STRING(100),
          unique: true,
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        loginAttempts: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        blockExpires: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        isCompleted: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false,
        },
        timezone: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        verified: {
          type: dbName === 'postgres' ? Sequelize.JSONB : Sequelize.JSON,
          allowNull: false,
          defaultValue: { email: true, phone: false },
          comment: 'Indicates if the user has verified their account.',
        },
        image: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        givenSMSConsent: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        loginEnabled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true,
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
          allowNull: true,
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
      await queryInterface.addIndex('gnrl_users', {
        fields: ['email', 'deletedAt'],
        unique: true,
        name: 'idx_unique_gnrl_users_email',
        transaction,
      });

      await queryInterface.addIndex('gnrl_users', {
        fields: ['phone', 'deletedAt'],
        unique: true,
        name: 'idx_unique_gnrl_users_phone',
        transaction,
      });

      await queryInterface.addIndex('gnrl_users', {
        fields: ['status', 'deletedAt'],
        name: 'idx_gnrl_user_status',
        transaction,
      });

      await queryInterface.addIndex('gnrl_users', {
        fields: ['firstName', 'lastName', 'deletedAt'],
        name: 'idx_gnrl_user_full_name',
        transaction,
      });
      await queryInterface.sequelize.query(
        `
        CREATE TRIGGER alter_gnrl_users_on_delete
        BEFORE UPDATE ON gnrl_users
        FOR EACH ROW
        BEGIN
          IF NEW.deletedAt IS NOT NULL AND OLD.deletedAt IS NULL THEN
            SET NEW.phone = CONCAT(OLD.phone, '-', OLD.id);
            SET NEW.email = CONCAT(OLD.email, '-', OLD.id);
          END IF;
        END
      `,
        { transaction }
      );
    } else if (dbName === 'postgres') {
      // Add indexes
      await queryInterface.addIndex('gnrl_users', {
        fields: [{ name: 'email', length: 191 }],
        unique: true,
        name: 'idx_unique_gnrl_users_email',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_users', {
        fields: ['phone'],
        unique: true,
        name: 'idx_unique_gnrl_users_phone',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_users', {
        fields: ['status'],
        name: 'idx_gnrl_user_status',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_users', {
        fields: ['firstName', 'lastName'],
        name: 'idx_gnrl_user_full_name',
        where: { deletedAt: null },
        transaction,
      });

      await queryInterface.addIndex('gnrl_users', {
        name: 'idx_gnrl_user_verified_gin',
        fields: ['verified'],
        using: 'GIN',
        transaction,
      });

      await queryInterface.sequelize.query(
        `
      CREATE OR REPLACE FUNCTION alter_gnrl_users_on_delete_fn()
      RETURNS trigger AS $$
      BEGIN
        IF NEW."deletedAt" IS NOT NULL THEN
          NEW."phone" := OLD."phone" || '-' || OLD."id";
          NEW."email" := OLD."email" || '-' || OLD."id";
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
          SELECT 1 FROM pg_trigger WHERE tgname = 'alter_gnrl_users_on_delete'
        ) THEN
          CREATE TRIGGER alter_gnrl_users_on_delete
          BEFORE UPDATE ON gnrl_users
          FOR EACH ROW
          WHEN (OLD."deletedAt" IS DISTINCT FROM NEW."deletedAt")
          EXECUTE FUNCTION alter_gnrl_users_on_delete_fn();
        END IF;
      END;
      $$;
        `,
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_logs_for_users'
            ) THEN
              CREATE TRIGGER trg_audit_logs_for_users
              AFTER INSERT OR UPDATE OR DELETE ON gnrl_users
              FOR EACH ROW
              -- WHEN (OLD.* IS DISTINCT FROM NEW.*)
              EXECUTE FUNCTION fn_audit_logs();
            END IF;
          END;
          $$;
        `,
        { transaction }
      );

      // LISTEN/NOTIFY channels
      await queryInterface.sequelize.query(
        `
            CREATE OR REPLACE FUNCTION gnrl_users_channels_fn()
            RETURNS trigger AS $$
            BEGIN
              PERFORM pg_notify('user_changes', row_to_json(NEW)::text);
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
                SELECT 1 FROM pg_trigger WHERE tgname = 'gnrl_users_channels'
              ) THEN
                CREATE TRIGGER gnrl_users_channels
                AFTER INSERT OR UPDATE OR DELETE ON gnrl_users
                FOR EACH ROW
                EXECUTE FUNCTION gnrl_users_channels_fn();
              END IF;
            END;
            $$;
              `,
        { transaction }
      );
    }

    await queryInterface.addColumn(
      'gnrl_audit_logs',
      'createdBy',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'gnrl_users',
          key: 'id',
        },
        allowNull: false,
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      { transaction }
    );

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
    await queryInterface.removeColumn('gnrl_audit_logs', 'createdBy', {
      transaction,
    });

    await queryInterface.removeIndex('gnrl_users', 'idx_gnrl_user_full_name', {
      transaction,
    });

    await queryInterface.removeIndex('gnrl_users', 'idx_unique_gnrl_users_email', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_users', 'idx_unique_gnrl_users_phone', {
      transaction,
    });
    await queryInterface.removeIndex('gnrl_users', 'idx_gnrl_user_status', {
      transaction,
    });

    await queryInterface.removeIndex('gnrl_users', 'idx_gnrl_user_full_name', {
      transaction,
    });

    if (dbName === 'mysql') {
      await queryInterface.sequelize.query(`DROP TRIGGER IF EXISTS alter_gnrl_users_on_delete;`, {
        transaction,
      });
    } else if (dbName === 'postgres') {
      await queryInterface.removeIndex('gnrl_users', 'idx_gnrl_user_verified_gin', {
        transaction,
      });

      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS trg_audit_logs_for_users ON gnrl_users;`,
        {
          transaction,
        }
      );

      await queryInterface.sequelize.query(
        `DROP TRIGGER IF EXISTS alter_gnrl_users_on_delete ON gnrl_users;`,
        {
          transaction,
        }
      );
      await queryInterface.sequelize.query(
        `DROP FUNCTION IF EXISTS alter_gnrl_users_on_delete_fn();`,
        {
          transaction,
        }
      );
    }
    await queryInterface.dropTable('gnrl_users', {
      transaction,
    });
    await transaction.commit();
  } catch (ex) {
    await transaction.rollback();
    throw ex;
  }
}

export { up, down };
