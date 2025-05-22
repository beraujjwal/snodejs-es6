'use strict';
import sequelize from './db.js';
import { Umzug, SequelizeStorage } from 'umzug';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const runMigrations = async (fileSet) => {
  const umzug = new Umzug({
    migrations: { glob: './src/database/migrations/*.js' }, // Path to your migration files
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console, // Log the migration process
  });

  try {
    console.log('Running Migrations...');
    await umzug.up(); // Runs all pending migrations
    console.log('Migrations executed successfully!');
    process.exit(0);
  } catch (ex) {
    console.error('Migration failed:', ex);
    process.exit(1);
  }
};

const rollbackMigration = async () => {
  const umzug = new Umzug({
    migrations: { glob: '../../database/migrations/*.js' },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  try {
    console.log('Rolling back last migration...');
    await umzug.down(); // Rolls back the last migration
    console.log('Rollback successful!');
    process.exit(0);
  } catch (ex) {
    console.error('Rollback failed:', ex);
    process.exit(1);
  }
};

const runSeeders = async () => {
  const umzug = new Umzug({
    migrations: { glob: '../../database/seeders/*.js' }, // Path to your seeder files
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: console,
  });

  try {
    console.log('Running Seeders...');
    await umzug.up(); // Runs all pending seeders
    console.log('Seeders executed successfully!');
    process.exit(0);
  } catch (ex) {
    console.error('Seeding failed:', ex);
    process.exit(1);
  }
};

export default async function (moduleArg) {
  const processName = moduleArg[1];
  const processAction = moduleArg[0].slice(4);
  const processActionOn = moduleArg[2];

  if (processAction === 'migration' && processName === 'up') {
    let fileSet = null;
    if (moduleArg[2] && moduleArg[2].toUpperCase() !== 'ALL') {
      fileTo = moduleArg[2];
    }
    await delay(1000);
    runMigrations(fileSet);
  } else if (processAction === 'migration' && processName === 'down') {
    let fileSet = null;

    if (moduleArg[2] && moduleArg[2].toUpperCase() !== 'ALL') {
      fileTo = moduleArg[2];
    }

    console.log('fileSet', fileSet);

    rollbackMigration(fileSet);
  }
}
