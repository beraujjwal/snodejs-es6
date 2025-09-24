'use strict';
import { execFile } from 'child_process';
import { promisify } from 'util';

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';
import convert from 'heic-convert';

const execFileAsync = promisify(execFile);
const __dirname = new URL('.', import.meta.url).pathname;

const tmpDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

import { BaseError } from '../system/core/error/baseError.js';

export const createThumbnailFromImage = async (
  inputPath,
  outputPath,
  width = 300
) => {
  try {
    const inputBase = path.join(tmpDir, inputPath);
    const outputBase = path.join(tmpDir, outputPath);
    await sharp(inputBase).resize({ width }).toFile(outputBase);
    console.log('✅ Thumbnail created at', outputBase);
  } catch (err) {
    console.error('❌ Error creating thumbnail:', err);
    throw new BaseError(err);
  }
};

export const createThumbnailFromHeicImage = async (
  inputPath,
  outputPath,
  convertedPath,
  width = 300
) => {
  try {
    const inputBase = path.join(tmpDir, inputPath);
    const convertedBase = path.join(tmpDir, convertedPath);
    const outputBase = path.join(tmpDir, outputPath);
    const inputBuffer = fs.readFileSync(inputBase);

    const outputBuffer = await convert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 90,
    });

    fs.writeFileSync(convertedBase, outputBuffer);

    await sharp(convertedBase)
      .resize({ width })
      .jpeg({ quality: 90 })
      .toFile(outputBase);
    console.log('✅ Thumbnail created at', inputPath, outputBase);
  } catch (err) {
    console.error('❌ Error creating thumbnail:', err);
    throw new BaseError(err);
  }
};

export const createThumbnailFromPdf = async (
  inputPath,
  outputPath,
  nameWithoutExtension,
  width = 300
) => {
  try {
    const inputBase = path.join(tmpDir, inputPath);
    const imageFileBase = path.join(tmpDir, nameWithoutExtension);
    const outputBase = path.join(tmpDir, outputPath);

    // Convert first page to JPG with Poppler
    await execFileAsync('pdftoppm', [
      '-f',
      '1', // start page
      '-l',
      '1', // end page
      '-singlefile', // only one file
      '-jpeg', // output format
      '-scale-to',
      '1200', // raster resolution
      inputBase,
      imageFileBase,
    ]);

    const imageFileNewName = `${imageFileBase}.jpg`;

    await sharp(imageFileNewName)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toFile(outputBase);
    console.log('✅ Thumbnail created at', outputBase);
  } catch (err) {
    console.error('❌ Error creating thumbnail:', err);
    throw new BaseError(err);
  }
};

export const base64ToThumbnail = async (base64String, width = 400) => {
  try {
    const buffer = Buffer.from(base64String, 'base64'); // Convert to Buffer

    // Resize image using Sharp
    const thumbnailBuffer = await sharp(buffer)
      .resize({ width: width }) // Set thumbnail size
      .toFormat('jpeg')
      .toBuffer();

    // Convert back to Base64
    const base64Thumbnail = `${thumbnailBuffer.toString('base64')}`;

    return base64Thumbnail;
  } catch (ex) {
    console.error('Thumbnail Generation Error:', ex);
    throw ex;
  }
};
