'use strict';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

import { BaseError } from '../system/core/error/baseError.js';
import BaseService from '../system/core/service/baseService.js';
import { generateThumbnail } from './thumbnailGenerator.js';
import { uploadFileInS3, deleteLocalFile } from '../libraries/s3.library.js';

const __dirname = new URL('.', import.meta.url).pathname;

const tmpDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
