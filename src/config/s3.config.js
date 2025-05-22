'use strict';
import {
  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  FILE_TEMP_PATH,
} from './config.js';

export default {
  bucketName: AWS_BUCKET_NAME,
  region: AWS_BUCKET_REGION,
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY,
  fileTempPath: FILE_TEMP_PATH,
};
