'use strict';
import {
  REDIS_PORT,
  REDIS_HOST,
  REDIS_EXPIRES_IN,
  REDIS_PASSWORD,
} from './config.js';

export default {
  port: REDIS_PORT,
  host: REDIS_HOST,
  url: `${REDIS_HOST}:${REDIS_PORT}`,
  expires: REDIS_EXPIRES_IN,
  password: REDIS_PASSWORD,
};
