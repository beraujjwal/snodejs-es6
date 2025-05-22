'use strict';
import { Sequelize, DataTypes, Model } from 'sequelize';
import config from '../../config/db.config.js';

const sequelize = new Sequelize(config.name, config.username, config.password, {
  host: config.host,
  port: config.port,
  dialect: config.dialect,
  logging: config.logging ? console.log : false,
  pool: {
    max: 10, // Increased max connections
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
  } catch (ex) {
    console.error(`Database connection failed: ${ex.message}`);
  }
};

connectToDatabase();

export default sequelize;
