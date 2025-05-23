'use strict';
const CURR_DIR = process.cwd();
import { URL } from 'url';
import chalk from 'chalk';
import { camelCase, pascalCase, constantCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';
import fs from 'fs';
const __dirname = new URL('.', import.meta.url).pathname;

const templatePath = `${__dirname}/sample`;

export default async function (moduleArg) {
  try {
    const processName = moduleArg[1];
    const processAction = moduleArg[0].slice(5);

    let fileSet = null;

    if (moduleArg[2] && moduleArg[2].toUpperCase() !== 'ALL') {
      const otherAction = moduleArg[2];
      console.log(otherAction);
      let action = otherAction.split('');
      fileSet = new Set(action);
    } else if (moduleArg[2] && moduleArg[2].toUpperCase() == 'ALL') {
      fileSet = new Set(['C', 'M', 'R', 'S', 'V']);
    }

    if (processAction != 'module') {
      switch (processAction) {
        case 'controller':
          if (fileSet) fileSet.delete('C');
          var { file, destPath, contents } =
            await createController(processName);
          break;
        case 'model':
          if (fileSet) fileSet.delete('M');
          var { file, destPath, contents } = await createModel(processName);
          break;
        case 'service':
          if (fileSet) fileSet.delete('S');
          var { file, destPath, contents } = await createService(processName);
          break;
        case 'validation':
          if (fileSet) fileSet.delete('V');
          var { file, destPath, contents } =
            await createValidation(processName);
          break;
        case 'middleware':
          var { file, destPath, contents } =
            await createMiddleware(processName);
          break;
        case 'route':
          if (fileSet) fileSet.delete('R');
          var { file, destPath, contents } = await createRoute(processName);
          break;
        case 'testCase':
          if (fileSet) fileSet.delete('T');
          var { file, destPath, contents } = await createTestCase(processName);
          break;
        case 'seeder':
          var { file, destPath, contents } = await createSeeder(processName);
          break;
        default:
          break;
      }

      await createAndWriteONFile(destPath, file, contents);
      if (fileSet) {
        for (let set of fileSet) {
          switch (set) {
            case 'C':
              var { file, destPath, contents } =
                await createController(processName);
              break;
            case 'M':
              var { file, destPath, contents } = await createModel(processName);
              break;
            case 'S':
              var { file, destPath, contents } =
                await createService(processName);
              break;
            case 'V':
              var { file, destPath, contents } =
                await createValidation(processName);
              break;
            case 'R':
              var { file, destPath, contents } = await createRoute(processName);
              break;
            case 'T':
              var { file, destPath, contents } =
                await createTestCase(processName);
              break;
            default:
              break;
          }
          await createAndWriteONFile(destPath, file, contents);
        }
      }
    }
  } catch (ex) {
    if (error.code === 'EEXIST') {
      console.error(chalk.redBright('Module already exists.'));
    } else {
      console.error(chalk.redBright(ex.message));
    }
  }
}

//For plural form with undes score
const transformToPluralSnakeCase = (input) => {
  return pluralize(snakeCase(input));
};

const transformToPluralCamelCase = (input) => {
  return camelCase(pluralize(input));
};

const transformToPluralPascalCase = (input) => {
  return pascalCase(pluralize(input));
};

const transformToPluralPascalUnderscoreCase = (input) => {
  return capitalCase(pluralize(input), { delimiter: '_' });
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

async function transformPluralConstant(processName) {
  let pluralProcessName = pluralize.plural(processName);
  return constantCase(pluralProcessName);
}

async function createController(processName) {
  let origFilePath = `${templatePath}/samples.controller.js`;
  let camelPluralProcessName = await transformPluralCamelCase(processName);
  let camelSingularProcessName = await transformSingularCamelCase(processName);
  let pascalSingularProcessName =
    await transformSingularPascalCase(processName);
  let singularProcessNameUpperCase =
    await transformSingularConstant(processName);
  let pluralProcessNameUpperCase = await transformPluralConstant(processName);

  let file = `${camelPluralProcessName}.controller.js`;
  console.log(chalk.blueBright(`Creating Controller: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');
  contents = contents.replace(
    /CONTROLLER_CAMEL_CASE_PLURAL_FORM/g,
    camelPluralProcessName
  );
  contents = contents.replace(
    /CONTROLLER_CAMEL_CASE_SINGULAR/g,
    camelSingularProcessName
  );
  contents = contents.replace(
    /MODEL_SINGULAR_FORM/g,
    pascalSingularProcessName
  );
  contents = contents.replace(
    /SINGULAR_PROCESS_NAME_UPPERCASE/g,
    singularProcessNameUpperCase
  );
  //contents = contents.replace( /PLURAL_PROCESS_NAME_UPPERCASE/g, pluralProcessNameUpperCase );

  let destPath = `${CURR_DIR}/src/app/controllers`;
  return { file, destPath, contents };
}

async function createModel(processName) {
  let origFilePath = `${templatePath}/sample.model.js`;
  let pascalSingularProcessName =
    await transformSingularPascalCase(processName);
  let camelSingularProcessName = await transformSingularCamelCase(processName);
  const snakeSingularProcessName = transformToPluralSnakeCase(processName);

  let file = `${camelSingularProcessName}.model.js`;
  console.log(chalk.blueBright(`Creating Model: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');
  contents = contents.replace(
    /MODEL_SINGULAR_FORM/g,
    pascalSingularProcessName
  );
  contents = contents.replace(
    /TABLE_NAME_PLURAL_FORM/g,
    snakeSingularProcessName
  );
  let destPath = `${CURR_DIR}/src/models`;
  return { file, destPath, contents };
}

async function createService(processName) {
  let origFilePath = `${templatePath}/sample.service.js`;
  let camelSingularProcessName = await transformSingularCamelCase(processName);

  let file = `${camelSingularProcessName}.service.js`;
  console.log(chalk.blueBright(`Creating Service: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');
  contents = contents.replace(
    /SERVICE_CAMEL_CASE_SINGULAR_FROM/g,
    camelSingularProcessName
  );
  let destPath = `${CURR_DIR}/src/app/services`;
  return { file, destPath, contents };
}

async function createValidation(processName) {
  let origFilePath = `${templatePath}/sample.validation.js`;
  let camelSingularProcessName = await transformSingularCamelCase(processName);

  let file = `${camelSingularProcessName}.validation.js`;
  console.log(chalk.blueBright(`Creating Validation: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');
  contents = contents.replace(
    /VALIDATION_CAMEL_CASE_SINGULAR_FROM/g,
    `${camelSingularProcessName}`
  );
  let destPath = `${CURR_DIR}/src/app/validations`;
  return { file, destPath, contents };
}

async function createMiddleware(processName) {
  let origFilePath = `${templatePath}/sample.middleware.js`;
  let camelSingularProcessName = transformSingularCamelCase(processName);

  let file = `${camelSingularProcessName}.middleware.js`;
  console.log(chalk.blueBright(`Creating Middleware: ${file}`));
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
  let paramCase = caseChanger.lower(processName);
  let paramSingularProcessName = pluralize.singular(paramCase);
  let paramPluralProcessName = pluralize.plural(paramCase);

  //Controller name
  let camelPluralProcessName = await transformPluralCamelCase(processName);
  //Validation name
  let camelSingularProcessName = await transformSingularCamelCase(processName);

  let file = `${camelPluralProcessName}.js`;
  console.log(chalk.blueBright(`Creating Route: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');

  contents = contents.replace(
    /SINGULAR_SAMLL_CASE/g,
    `${paramSingularProcessName}`
  );

  contents = contents.replace(
    /PLURAL_SAMLL_CASE/g,
    `${paramPluralProcessName}`
  );

  contents = contents.replace(
    /CONTROLLER_CAMEL_CASE_PLURAL_FORM/g,
    `${camelPluralProcessName}`
  );

  contents = contents.replace(
    /VALIDATION_CAMEL_CASE_SINGULAR_FROM/g,
    `${camelSingularProcessName}`
  );

  let destPath = `${CURR_DIR}/src/routes`;
  return { file, destPath, contents };
}

async function createTestCase(processName) {
  let origFilePath = `${templatePath}/sample.testCase.js`;
  let paramCase = caseChanger.lower(processName);
  let paramSingularProcessName = pluralize.singular(paramCase);
  let paramPluralProcessName = pluralize.plural(paramCase);

  let pascalSingularProcessName =
    await transformSingularPascalCase(processName);

  const d = new Date();
  let time = d.getTime();

  let file = `${time}.${pascalSingularProcessName}.js`;
  console.log(chalk.blueBright(`Creating Test Case: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');

  contents = contents.replace(
    /SINGULAR_SAMLL_CASE/g,
    `${paramSingularProcessName}`
  );

  contents = contents.replace(
    /PLURAL_SAMLL_CASE/g,
    `${paramPluralProcessName}`
  );

  contents = contents.replace(
    /MODEL_SINGULAR_FORM/g,
    `${pascalSingularProcessName}`
  );

  let destPath = `${CURR_DIR}/src/test`;
  return { file, destPath, contents };
}

async function createSeeder(processName) {
  let origFilePath = `${templatePath}/sample.testCase.js`;
  let paramCase = caseChanger.lower(processName);
  let paramSingularProcessName = pluralize.singular(paramCase);
  let paramPluralProcessName = pluralize.plural(paramCase);

  let pascalSingularProcessName =
    await transformSingularPascalCase(processName);

  const d = new Date();
  let time = d.getTime();

  let file = `${time}.${paramPluralProcessName}.js`;
  console.log(chalk.blueBright(`Creating Test Case: ${file}`));
  let contents = fs.readFileSync(origFilePath, 'utf8');

  contents = contents.replace(
    /SINGULAR_SAMLL_CASE/g,
    `${paramSingularProcessName}`
  );

  contents = contents.replace(
    /PLURAL_SAMLL_CASE/g,
    `${paramPluralProcessName}`
  );

  contents = contents.replace(
    /MODEL_SINGULAR_FORM/g,
    `${pascalSingularProcessName}`
  );

  let destPath = `${CURR_DIR}/test`;
  return { file, destPath, contents };
}

async function createAndWriteONFile(destPath, file, contents) {
  fs.mkdirSync(`${destPath}`, { recursive: true }, (err) => {});
  const writePath = `${destPath}/${file}`;
  if (!fs.existsSync(writePath)) {
    fs.writeFileSync(writePath, contents, 'utf8');
    console.log('Path:', chalk.greenBright(writePath));
    console.log(chalk.blueBright('File Generation Completed'));
  } else {
    console.error(chalk.redBright(`${file} already exists.`));
  }
}
