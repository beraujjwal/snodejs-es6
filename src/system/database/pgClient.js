'use strict';
import config from '../../config/db.config.js';
import { Client } from 'pg';

export const pgClient = new Client({
  connectionString: `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.name}`,
});
