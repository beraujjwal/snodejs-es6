'use strict';
import { Sequelize } from 'sequelize';
import config from '../../config/db.config.js';
import { info, warn, slowQuery } from '../../helpers/logger.js';

const sequelize = new Sequelize(config.name, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  benchmark: true,
  logging: config.logging
    ? (sql, timing) => {
        if (timing > config.slowQueryTime) {
          warn(`⚠️  SQL Executed - ${sql} - [${timing}ms]`);
          slowQuery(`SQL: ${sql} - [${timing}ms]`);
        } else {
          info(`📝  SQL Executed - ${sql} - [${timing}ms]`);
        }
      }
    : false,
  pool: {
    max: 20, // Increased max connections
    min: 5,
    acquire: 60000,
    idle: 10000,
    evictionRunIntervalMillis: 5000,
  },
});

export { sequelize };
