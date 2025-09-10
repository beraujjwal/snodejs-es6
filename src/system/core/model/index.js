'use strict';
import 'dotenv/config';

import { fileURLToPath } from 'url';
import { pascalCase } from 'change-case';
import pluralize from 'pluralize';
import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsPath = path.join(__dirname, '../../../models/');
const db = {};

// Function to dynamically import all models
const loadModels = async () => {
  const files = fs
    .readdirSync(modelsPath)
    .filter((file) => file.endsWith('.js'));

  const modelPromises = files.map(async (file) => {
    const modelName = pascalCase(
      pluralize.singular(file.replace('.model.js', ''))
    );
    const model = await import(path.join(modelsPath, file));
    db[modelName] = model.default;
  });

  await Promise.all(modelPromises);
};

// Ensure models are loaded before exporting
await loadModels();

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

export default db;
