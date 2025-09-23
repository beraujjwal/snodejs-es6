'use strict';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Umzug, SequelizeStorage } from 'umzug';
import { sequelize } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Executes all pending migrations in the database.
 *
 * This function utilizes the Umzug library to manage database migrations. It connects
 * to the database using the Sequelize instance and applies all pending migrations located
 * in the specified directory. If the Sequelize instance is not initialized, an error is thrown.
 *
 * In case of an error during the migration process, the error is logged to the console.
 * Finally, it ensures the database connection is properly closed.
 *
 * @throws {Error} If the Sequelize instance is not initialized.
 */
const runMigrations = async ({ to, step, logging = false } = {}) => {
  try {
    if (!sequelize) {
      throw new Error(
        '❌ Sequelize instance is not initialized. Check database connection.'
      );
    }

    const migrator = new Umzug({
      migrations: {
        glob: path.join(__dirname, '../../database/migrations/*.js'),
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({
        sequelize,
        modelName: 'DB_MigrationMetas',
      }),
      logger: logging ? console : undefined,
    });

    // Run migrations
    let result;
    if (to) {
      result = await migrator.up({ to });
    } else if (step) {
      result = await migrator.up({ step });
    } else {
      result = await migrator.up();
    }

    console.log(
      `✅ Migrations completed:`,
      result.map((m) => m.name)
    );
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exitCode = 1; // safer than process.exit(1) here
  } finally {
    try {
      await sequelize.close();
      console.log('🔌 Database connection closed.');
    } catch (closeError) {
      console.error('⚠️ Error closing DB connection:', closeError);
    }
  }
};
// await runMigrations({ logging: true });           // Run all migrations with logs
// await runMigrations({ to: '20230801-create-users.js' }); // Run until a specific migration
// await runMigrations({ step: 1 });

/**
 * Rolls back the last migration in the database.
 *
 * @author Ujjwal Bera
 * @async
 * @function rollbackMigration
 * @returns {Promise<void>}
 */
const rollbackMigrations = async ({ to, step, logging = false } = {}) => {
  try {
    if (!sequelize) {
      throw new Error('❌ Sequelize instance is not initialized.');
    }

    const migrator = new Umzug({
      migrations: {
        glob: path.join(__dirname, '../../database/migrations/*.js'),
      },
      storage: new SequelizeStorage({
        sequelize,
        modelName: 'DB_MigrationMetas',
      }),
      context: sequelize.getQueryInterface(),
      logger: logging ? console : undefined,
    });

    const executedMigrations = await migrator.executed();

    if (!executedMigrations.length) {
      console.log('ℹ️ No migrations to rollback.');
      return;
    }

    let result;
    if (to) {
      result = await migrator.down({ to });
    } else if (step) {
      result = await migrator.down({ step });
    } else {
      result = await migrator.down(); // Rolls back last migration
    }

    console.log(
      `✅ Rolled back migrations:`,
      result.map((m) => m.name)
    );
  } catch (error) {
    console.error('❌ Rollback error:', error.message);
    process.exitCode = 1; // safer than process.exit(1)
  } finally {
    try {
      await sequelize.close();
      console.log('🔌 Database connection closed.');
    } catch (closeError) {
      console.error('⚠️ Error closing DB connection:', closeError);
    }
  }
};
// await rollbackMigrations({ logging: true });  // Rollback last migration
// await rollbackMigrations({ step: 2 });        // Rollback last 2 migrations
// await rollbackMigrations({ to: '20230801-create-users.js' }); // Rollback to specific

// node migrate.js up
// node migrate.js down --step=2
// node migrate.js up --to=some-migration.js

/**
 * Executes all pending seeders in the database.
 *
 * This function utilizes the Umzug library to manage database seeders. It connects
 * to the database using the Sequelize instance and applies all pending seeders located
 * in the specified directory. If the Sequelize instance is not initialized, an error is thrown.
 *
 * In case of an error during the seeding process, the error is logged to the console.
 * Finally, it ensures the database connection is properly closed.
 *
 * @throws {Error} If the Sequelize instance is not initialized.
 */

const runSeeders = async ({ to, step, logging = false } = {}) => {
  try {
    if (!sequelize) {
      throw new Error('❌ Sequelize instance is not initialized.');
    }

    const seeder = new Umzug({
      migrations: {
        glob: path.join(__dirname, '../../database/seeders/*.js'),
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize, modelName: 'DB_SeederMetas' }), // separate storage table from migrations
      logger: logging ? console : undefined,
    });

    let result;
    if (to) {
      result = await seeder.up({ to });
    } else if (step) {
      result = await seeder.up({ step });
    } else {
      result = await seeder.up();
    }

    console.log(
      `✅ Seeders executed:`,
      result.map((s) => s.name)
    );
  } catch (error) {
    console.log(error);
    console.log(error.StackTrace);
    console.error('❌ Seeder execution error:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await sequelize.close();
      console.log('🔌 Database connection closed.');
    } catch (closeError) {
      console.error('⚠️ Error closing DB connection:', closeError);
    }
  }
};

const rollbackSeeders = async ({ to, step, logging = false } = {}) => {
  try {
    if (!sequelize) {
      throw new Error('❌ Sequelize instance is not initialized.');
    }

    const seeder = new Umzug({
      migrations: {
        glob: path.join(__dirname, '../../database/seeders/*.js'),
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize, modelName: 'DB_SeederMetas' }),
      logger: logging ? console : undefined,
    });

    const executedSeeders = await seeder.executed();

    if (!executedSeeders.length) {
      console.log('ℹ️ No seeders to rollback.');
      return;
    }

    let result;
    if (to) {
      result = await seeder.down({ to });
    } else if (step) {
      result = await seeder.down({ step });
    } else {
      result = await seeder.down(); // Rollback last seeder
    }

    console.log(
      `✅ Rolled back seeders:`,
      result.map((s) => s.name)
    );
  } catch (error) {
    console.error('❌ Seeder rollback error:', error.message);
    process.exitCode = 1;
  } finally {
    try {
      await sequelize.close();
      console.log('🔌 Database connection closed.');
    } catch (closeError) {
      console.error('⚠️ Error closing DB connection:', closeError);
    }
  }
};
// await rollbackSeeders({ logging: true }); // Rollback last seeder
// await rollbackSeeders({ step: 2 });       // Rollback last 2 seeders
// await rollbackSeeders({ to: '20230801-add-users.js' }); // Rollback until a specific seeder

export { runMigrations, rollbackMigrations, runSeeders, rollbackSeeders };
