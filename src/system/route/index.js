'use strict';
import 'dotenv/config';

import { URL } from 'url';
import express from 'express';
import fs from 'fs';
import path from 'path';
const __dirname = new URL('.', import.meta.url).pathname;
const routesPath = __dirname + '/../../routes/';
const basename = 'index.js';

const app = express();

fs.readdirSync(routesPath)
  .filter((file) => {
    if (file.indexOf('.') !== 0 && file.slice(-3) === '.js') {
      return file;
    }

    const innerDirPath = routesPath + file + '/';
    fs.readdirSync(innerDirPath)
      .filter((innerFile) => {
        return (
          innerFile.indexOf('.') !== 0 &&
          innerFile !== basename &&
          innerFile.slice(-3) === '.js'
        );
      })
      .forEach(async (innerFile) => {
        const routeName = await import(path.join(innerDirPath, innerFile));
        if (!routeName.default)
          throw new Error(
            `Module ${path.join(innerDirPath, innerFile)} does not have a default export.`
          );
        app.use(`/api/${file}/`, routeName.default);
      });
  })
  .forEach(async (file) => {
    const routeName = await import(path.join(routesPath, file));
    if (!routeName.default)
      throw new Error(
        `Module ${path.join(routesPath, file)} does not have a default export.`
      );
    app.use(`/api/`, routeName.default);
  });

export default app;
