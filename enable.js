/* eslint-env node */
'use strict';
import { info } from './src/helpers/console.js';

import enableModule from './src/system/generator/enableModule.js';

async function main() {
  try {
    const argumentsArr = process.argv.slice(2);
    const processAction = argumentsArr[0];
    const actionArr = ['redis', 'socket', 'kafka', 'neo4j'];
    if (actionArr.includes(processAction)) {
      await enableModule(processAction);
      info('start here');
    } else {
      throw new Error('Invalid Command');
    }

    // if (argumentsArr.length === 2 && argumentsArr[0].indexOf(':') === 4) {
    //   let processAction = argumentsArr[0].slice(5);
    //   let actionArr = ['redis', 'socket', 'kafka', 'neo4j'];
    //   if (actionArr.includes(processAction)) {
    //     await moduleGenerator(argumentsArr);
    //   } else {
    //     log(chalk.bgRed.bold('Invalid Make Command'));
    //   }
    // } else {
    //   throw new Error('Invalid Command');
    // }
  } catch (ex) {
    info(ex.message);
  }
}

main();
