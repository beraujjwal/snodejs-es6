'use strict';
const { S3Client } = require('@aws-sdk/client-s3');
import config from '../config/s3.config.js';

const credentials = {
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
};
const client = new S3Client({
  apiVersion: '2010-08-01',
  region: config.region,
  credentials,
});

export default client;
