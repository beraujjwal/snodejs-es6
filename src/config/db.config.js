'use strict';
import {
  DB_DIALECT,
  DB_HOST,
  DB_DATABASE,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_SYNC,
  DB_QUERY_LOG,
} from './config.js';

export default {
  dialect: DB_DIALECT,
  host: DB_HOST,
  name: DB_DATABASE,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  sync: DB_SYNC,
  logging: DB_QUERY_LOG,
};
