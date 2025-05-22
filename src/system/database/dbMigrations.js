'use strict';

import {
  runMigrations,
  runSeeders,
  rollbackMigration,
} from './migrationRunner.js';

const dbManipulation = async (moduleArg) => {
  const processName = moduleArg[1];
  const processAction = moduleArg[0].slice(4);

  console.log('processName', processName);
  console.log('processAction', processAction);
  console.log('arguments', moduleArg);

  if (processAction === 'migration' && processName === 'up') {
    let fileSet = null;
    if (moduleArg[2] && moduleArg[2].toUpperCase() !== 'ALL') {
      fileTo = moduleArg[2];
    }
    console.log('fileSet', fileSet);
    await delay(1000);
    runMigrations(fileSet);
  } else if (processAction === 'migration' && processName === 'down') {
    let fileSet = null;

    if (moduleArg[2] && moduleArg[2].toUpperCase() !== 'ALL') {
      fileTo = moduleArg[2];
    }

    console.log('fileSet', fileSet);

    rollbackMigration(fileSet);
  } else if (processAction === 'seeder' && processName === 'up') {
    let fileSet = null;
    if (moduleArg[2] && moduleArg[2].toUpperCase() !== 'ALL') {
      fileTo = moduleArg[2];
    }
    await delay(1000);
    runSeeders(fileSet);
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export { dbManipulation };
