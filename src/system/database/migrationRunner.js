'use strict';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Umzug, SequelizeStorage } from 'umzug';
import { connectToDatabase } from '../core/db.connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to run migrations
const runMigrations = async () => {
  const sequelize = await connectToDatabase();

  if (!sequelize) {
    throw new Error(
      'Sequelize instance is not initialized. Check database connection.'
    );
  }

  const migrator = new Umzug({
    migrations: {
      glob: path.join(__dirname, '../../database/migrations/*.js'),
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
  });

  await migrator.up();
  process.exit(1);
};

async function rollbackMigration() {
  const sequelize = await connectToDatabase();
  console.log('Database connected successfully.');
  try {
    const migrator = new Umzug({
      migrations: {
        glob: path.join(__dirname, '../../database/migrations/*.js'),
      },
      storage: new SequelizeStorage({ sequelize }),
      context: sequelize.getQueryInterface(),
      logger: console,
    });

    const executedMigrations = await migrator.executed();

    if (executedMigrations.length === 0) {
      console.log('No migrations to rollback.');
      return;
    }

    await migrator.down(); // Rolls back the last migration
    console.log('Last migration rolled back successfully.');
  } catch (error) {
    console.error('Error rolling back migration:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(1);
  }
}

// Function to run seeders
const runSeeders = async () => {
  const sequelize = await connectToDatabase();

  if (!sequelize) {
    throw new Error(
      'Sequelize instance is not initialized. Check database connection.'
    );
  }
  try {
    const seeder = new Umzug({
      migrations: {
        glob: path.join(__dirname, '../../database/seeders/*.js'),
      },
      context: sequelize.getQueryInterface(),
      storage: new SequelizeStorage({ sequelize }),
    });

    await seeder.up();
  } catch (error) {
    console.error('Error rolling back migration:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    process.exit(1);
  }
};

export { runMigrations, runSeeders, rollbackMigration };
