'use strict';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { FILE_TEMP_PATH } from '../config/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMP_DIR = path.join(__dirname, FILE_TEMP_PATH);
const DELETE_AFTER_MS = 5 * 60 * 1000;

export const deleteOldTempFiles = async () => {
  fs.readdir(TEMP_DIR, (ex, files) => {
    if (ex) return console.error('Failed to read temp dir:', ex);

    files.forEach((file) => {
      const filePath = path.join(TEMP_DIR, file);

      fs.stat(filePath, (ex, stats) => {
        if (ex) return console.error('Failed to stat file:', ex);

        const now = Date.now();
        const fileTime = new Date(stats.mtime).getTime();

        if (now - fileTime > DELETE_AFTER_MS) {
          fs.unlink(filePath, (ex) => {
            if (ex) console.error('Failed to delete:', filePath);
            else console.log('Deleted temp file:', filePath);
          });
        }
      });
    });
  });
};
