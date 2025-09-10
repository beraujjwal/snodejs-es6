'use strict';

import {
  runMigrations,
  rollbackMigrations,
  runSeeders,
  rollbackSeeders,
} from './migrationRunner.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const dbManipulation = async (moduleArg) => {
  const processName = moduleArg[1]; // 'up' or 'down'
  const processAction = moduleArg[0].slice(4); // 'migration' or 'seeder'
  let fileTarget = null;

  if (moduleArg[2] && moduleArg[2].toUpperCase() !== 'ALL') {
    fileTarget = moduleArg[2];
  }

  try {
    await delay(1000); // optional wait before execution

    if (processAction === 'migration' && processName === 'up') {
      await runMigrations({ to: fileTarget });
    } else if (processAction === 'migration' && processName === 'down') {
      await rollbackMigrations({ to: fileTarget });
    } else if (processAction === 'seeder' && processName === 'up') {
      await runSeeders({ to: fileTarget });
    } else if (processAction === 'seeder' && processName === 'down') {
      await rollbackSeeders({ to: fileTarget });
    } else {
      console.error(
        '❌ Unknown command. Usage: db:ACTION up|down [filename|ALL]'
      );
    }
  } catch (err) {
    console.error(`❌ Error executing ${processAction} ${processName}:`, err);
    process.exitCode = 1;
  }
};
