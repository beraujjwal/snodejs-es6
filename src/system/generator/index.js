'use strict';
const CURR_DIR = process.cwd();
import { URL } from 'url';
import chalk from 'chalk';
import { camelCase, pascalCase, constantCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';
import fs from 'fs';
const __dirname = new URL('.', import.meta.url).pathname;

const templatePath = `${__dirname}/sample`;

import { info, error } from '../../helpers/logger.js';

export default async function (moduleArg) {
  try {
    const processName = moduleArg[1];
    const processAction = moduleArg[0].slice(5);

    let fileSet = null;

    if (moduleArg[2] && moduleArg[2].toUpperCase() !== 'ALL') {
      const otherAction = moduleArg[2];
      let action = otherAction.split('');
      fileSet = new Set(action);
    } else if (moduleArg[2] && moduleArg[2].toUpperCase() == 'ALL') {
      fileSet = new Set(['C', 'M', 'R', 'S', 'V']);
    }

    let file = null,
      destPath = null,
      contents = null;
    if (processAction != 'module') {
      switch (processAction) {
        case 'controller':
          if (fileSet) fileSet.delete('C');
          ({ file, destPath, contents } = await createController(processName));
          break;
        case 'model':
          if (fileSet) fileSet.delete('M');
          ({ file, destPath, contents } = await createModel(processName));
          break;
        case 'service':
          if (fileSet) fileSet.delete('S');
          ({ file, destPath, contents } = await createService(processName));
          break;
        case 'validation':
          if (fileSet) fileSet.delete('V');
          ({ file, destPath, contents } = await createValidation(processName));
          break;
        case 'middleware':
          ({ file, destPath, contents } = await createMiddleware(processName));
          break;
        case 'route':
          if (fileSet) fileSet.delete('R');
          ({ file, destPath, contents } = await createRoute(processName));
          break;
        case 'testCase':
          if (fileSet) fileSet.delete('T');
          ({ file, destPath, contents } = await createTestCase(processName));
          break;
        case 'migration':
          ({ file, destPath, contents } = await createMigration(processName));
          break;
        case 'seeder':
          ({ file, destPath, contents } = await createSeeder(processName));
          break;
        default:
          break;
      }

      await createAndWriteONFile(destPath, file, contents);
      if (fileSet) {
        for (let set of fileSet) {
          switch (set) {
            case 'C':
              ({ file, destPath, contents } = await createController(processName));
              break;
            case 'M':
              ({ file, destPath, contents } = await createModel(processName));
              break;
            case 'S':
              ({ file, destPath, contents } = await createService(processName));
              break;
            case 'V':
              ({ file, destPath, contents } = await createValidation(processName));
              break;
            case 'R':
              ({ file, destPath, contents } = await createRoute(processName));
              break;
            case 'T':
              ({ file, destPath, contents } = await createTestCase(processName));
              break;
            default:
              break;
          }
          await createAndWriteONFile(destPath, file, contents);
        }
      }
    }
  } catch (error) {
    if (error.code === 'EEXIST') {
      error(chalk.redBright('Module already exists.'));
    } else {
      error(chalk.redBright(error.message));
    }
  }
}

//For plural form with undes score
const transformToPluralSnakeCase = (input) => {
  return pluralize(snakeCase(input));
};

async function transformSingularCamelCase(processName) {
  let singularProcessName = pluralize.singular(processName);
  return camelCase(singularProcessName);
}

async function transformPluralCamelCase(processName) {
  let pluralProcessName = pluralize.plural(processName);
  return camelCase(pluralProcessName);
}

async function transformSingularPascalCase(processName) {
  let singularProcessName = pluralize.singular(processName);
  return pascalCase(singularProcessName);
}

async function transformSingularConstant(processName) {
  let singularProcessName = pluralize.singular(processName);
  return constantCase(singularProcessName);
}

//New Optimize function
// To Create Controller name
const toPascalPlural = (input) => {
  const singularForm = pluralize.singular(input);
  const pascal = pascalCase(singularForm);
  return pluralize(pascal);
};

// To Create file name for service & Model
const toPascalSingular = (input) => {
  const singular = pluralize.singular(input); // Normalize to singular
  return pascalCase(singular); // Convert to PascalCase
};

// To Create file name for controller
const toCamelPlural = (input) => {
  const singular = pluralize.singular(input); // Normalize to singular
  return camelCase(singular); // Convert to camelCase
};

// To Create file name for service & validation
const toCamelSingular = (input) => {
  const singular = pluralize.singular(input); // Normalize to singular
  return camelCase(singular); // Convert to camelCase
};

async function createController(processName) {
  let origFilePath = `${templatePath}/samples.controller.js`;
  let singularProcessNameUpperCase = await transformSingularConstant(processName);

  const controllerFileName = `${toCamelPlural(processName)}`;
  const controllerName = toPascalPlural(processName);
  const serviceFileName = `${toCamelSingular(processName)}`;
  const serviceName = toPascalSingular(processName);

  const file = `${controllerFileName}.controller.js`;
  info(chalk.blueBright(`Creating Controller: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');
  contents = contents.replace(/CONTROLLER_CAMEL_CASE_PLURAL_FORM/g, controllerName);
  contents = contents.replace(/CONTROLLER_CAMEL_CASE_SINGULAR/g, serviceFileName);
  contents = contents.replace(/MODEL_SINGULAR_FORM/g, serviceName);
  contents = contents.replace(/SINGULAR_PROCESS_NAME_UPPERCASE/g, singularProcessNameUpperCase);

  let destPath = `${CURR_DIR}/src/app/controllers`;
  return { file, destPath, contents };
}

async function createModel(processName) {
  let origFilePath = `${templatePath}/sample.model.js`;
  let pascalSingularProcessName = await transformSingularPascalCase(processName);
  let camelSingularProcessName = await transformSingularCamelCase(processName);
  const snakeSingularProcessName = transformToPluralSnakeCase(processName);

  let file = `${camelSingularProcessName}.model.js`;
  info(chalk.blueBright(`Creating Model: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');
  contents = contents.replace(/MODEL_SINGULAR_FORM/g, pascalSingularProcessName);
  contents = contents.replace(/TABLE_NAME_PLURAL_FORM/g, snakeSingularProcessName);
  let destPath = `${CURR_DIR}/src/models`;
  return { file, destPath, contents };
}

async function createService(processName) {
  let origFilePath = `${templatePath}/sample.service.js`;
  const serviceName = toPascalSingular(processName);
  const serviceFileName = `${toCamelSingular(processName)}`;

  let file = `${serviceFileName}.service.js`;
  info(chalk.blueBright(`Creating Service: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');
  contents = contents.replace(/SERVICE_SINGULAR_FORM/g, serviceName);
  let destPath = `${CURR_DIR}/src/app/services`;
  return { file, destPath, contents };
}

async function createValidation(processName) {
  let origFilePath = `${templatePath}/sample.validation.js`;
  let camelSingularProcessName = await transformSingularCamelCase(processName);

  const validationName = toPascalSingular(processName);

  let file = `${camelSingularProcessName}.validation.js`;
  info(chalk.blueBright(`Creating Validation: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');
  contents = contents.replace(/VALIDATION_CAMEL_CASE_SINGULAR_FROM/g, `${validationName}`);
  let destPath = `${CURR_DIR}/src/app/validations`;
  return { file, destPath, contents };
}

async function createMiddleware(processName) {
  let origFilePath = `${templatePath}/sample.middleware.js`;
  let camelSingularProcessName = transformSingularCamelCase(processName);

  let file = `${camelSingularProcessName}.middleware.js`;
  info(chalk.blueBright(`Creating Middleware: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');
  contents = contents.replace(
    /MIDDLEWARE_CAMEL_CASE_SINGULAR_FROM/g,
    `${camelSingularProcessName}`
  );
  let destPath = `${CURR_DIR}/src/app/middlewares`;
  return { file, destPath, contents };
}

async function createRoute(processName) {
  let origFilePath = `${templatePath}/sample.route.js`;
  let paramCase = paramCase(processName);
  let paramSingularProcessName = pluralize.singular(paramCase);
  let paramPluralProcessName = pluralize.plural(paramCase);

  //Controller name
  let camelPluralProcessName = await transformPluralCamelCase(processName);
  //Validation name
  let camelSingularProcessName = await transformSingularCamelCase(processName);

  let file = `${camelPluralProcessName}.js`;
  info(chalk.blueBright(`Creating Route: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');

  contents = contents.replace(/SINGULAR_SAMLL_CASE/g, `${paramSingularProcessName}`);

  contents = contents.replace(/PLURAL_SAMLL_CASE/g, `${paramPluralProcessName}`);

  contents = contents.replace(/CONTROLLER_CAMEL_CASE_PLURAL_FORM/g, `${camelPluralProcessName}`);

  contents = contents.replace(
    /VALIDATION_CAMEL_CASE_SINGULAR_FROM/g,
    `${camelSingularProcessName}`
  );

  let destPath = `${CURR_DIR}/src/routes`;
  return { file, destPath, contents };
}

async function createTestCase(processName) {
  let origFilePath = `${templatePath}/sample.testCase.js`;
  let paramCase = paramCase(processName);
  let paramSingularProcessName = pluralize.singular(paramCase);
  let paramPluralProcessName = pluralize.plural(paramCase);

  let pascalSingularProcessName = await transformSingularPascalCase(processName);

  const d = new Date();
  let time = d.getTime();

  let file = `${time}.${pascalSingularProcessName}.js`;
  info(chalk.blueBright(`Creating Test Case: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');

  contents = contents.replace(/SINGULAR_SAMLL_CASE/g, `${paramSingularProcessName}`);

  contents = contents.replace(/PLURAL_SAMLL_CASE/g, `${paramPluralProcessName}`);

  contents = contents.replace(/MODEL_SINGULAR_FORM/g, `${pascalSingularProcessName}`);

  let destPath = `${CURR_DIR}/src/test`;
  return { file, destPath, contents };
}

async function createMigration(processName) {
  try {
    const origFilePath = `${templatePath}/sample.migration.js`;
    const snakeSingularProcessName = transformToPluralSnakeCase(processName);
    const fileNamePrifix = formatDateToCustomString();
    const file = `${fileNamePrifix}-create-table-${snakeSingularProcessName}.js`;
    info(chalk.blueBright(`Creating Migration: ${file}`));
    let contents = fs.readFileSync(origFilePath, 'utf8');

    contents = contents.replace(/TABLE_NAME_PLURAL_FORM/g, snakeSingularProcessName);

    const destPath = `${CURR_DIR}/src/database/migrations`;
    return { file, destPath, contents };
  } catch (error) {
    error(chalk.redBright(`Error creating migration: ${error.message}`));
    process.exit(1);
  }
}

async function createSeeder(processName) {
  info('Create seeding...');
  let origFilePath = `${templatePath}/sample.seeder.js`;
  let paramSingularProcessName = pluralize.singular(processName);
  let paramPluralProcessName = pluralize.plural(processName);
  const snakeSingularProcessName = transformToPluralSnakeCase(processName);

  let pascalSingularProcessName = await transformSingularPascalCase(processName);

  const fileNamePrifix = formatDateToCustomString();

  let file = `${fileNamePrifix}-create-${paramPluralProcessName}.js`;
  info(chalk.blueBright(`Creating Test Case: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');

  contents = contents.replace(/TABLE_NAME_PLURAL_FORM/g, snakeSingularProcessName);

  contents = contents.replace(/SINGULAR_SAMLL_CASE/g, `${paramSingularProcessName}`);

  contents = contents.replace(/PLURAL_SAMLL_CASE/g, `${paramPluralProcessName}`);

  contents = contents.replace(/MODEL_SINGULAR_FORM/g, `${pascalSingularProcessName}`);

  let destPath = `${CURR_DIR}/src/database/seeders`;
  return { file, destPath, contents };
}

async function createAndWriteONFile(destPath, file, contents) {
  fs.mkdirSync(`${destPath}`, { recursive: true }, (err) => {});
  const writePath = `${destPath}/${file}`;
  if (!fs.existsSync(writePath)) {
    fs.writeFileSync(writePath, contents, 'utf8');
    info('Path:', chalk.greenBright(writePath));
    info(chalk.blueBright('File Generation Completed'));
  } else {
    error(chalk.redBright(`${file} already exists.`));
  }
}

const formatDateToCustomString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};
