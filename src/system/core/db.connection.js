'use strict';
import { Sequelize, DataTypes, Model } from 'sequelize';
import config from '../../config/db.config.js';

console.log('config', config);

let sequelize = null;
const connectToDatabase = async () => {
  try {
    sequelize = new Sequelize(config.name, config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: config.dialect,
      logging: config.logging ? (sql) => console.log('📝  SQL', sql) : false,
      pool: {
        max: 20, // Increased max connections
        min: 5,
        acquire: 60000,
        idle: 10000,
        evictionRunIntervalMillis: 5000,
      },
    });
    await sequelize.authenticate();

    console.log('🗄️   Database connection has been established successfully.');
    if (config.sync) {
      try {
        await sequelize.sync({ alter: true });
        console.log('DB & Model synced successfully!');
      } catch (ex) {
        console.error(`Table creation failed: ${ex.message}`);
      }
    }
    return sequelize;
  } catch (ex) {
    console.error(ex);
    console.error(`⚠️   Database connection failed: ${ex.message}`);
  }
};

connectToDatabase();

export { sequelize, DataTypes, Model, connectToDatabase };
