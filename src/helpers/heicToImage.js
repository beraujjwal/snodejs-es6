'use strict';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import convert from 'heic-convert';

const __dirname = new URL('.', import.meta.url).pathname;

const tmpDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
import { BaseError } from '../system/core/error/baseError.js';

export const convertHeicToJpeg = async (inputPath, outputPath) => {
  try {
    const inputBase = path.join(tmpDir, inputPath);
    const convertedBase = path.join(tmpDir, outputPath);
    const inputBuffer = fs.readFileSync(inputBase);

    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 90,
    });

    fs.writeFileSync(convertedBase, outputBuffer);
  } catch (err) {
    console.error('❌ Error convert to jpg:', err);
    throw new BaseError(err);
  }
};

// Example
convertHeicToJpeg('./photo.heic', './photo.jpg');
