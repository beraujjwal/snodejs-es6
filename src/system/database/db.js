'use strict';
import { Sequelize, DataTypes, Model } from 'sequelize';
import config from '../../config/db.config.js';
const sequelize = new Sequelize(config.name, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  benchmark: true,
  //logging: config.logging ? (sql) => console.log('📝 SQL', sql) : false,
  logging: config.logging
    ? (sql, timing) => {
        if (timing > 10) {
          console.warn(`⚠️  SQL Executed - ${sql} - [${timing}ms]`);
        } else {
          console.log(`📝  SQL Executed - ${sql} - [${timing}ms]`);
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

//console.log('sequelize', sequelize);
export { sequelize };
