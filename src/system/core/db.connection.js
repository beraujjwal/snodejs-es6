'use strict';
import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import { sequelize } from '../database/db.js';
import config from '../../config/db.config.js';

/**
 * Establishes a connection to the database.
 *
 * @returns {Promise<Sequelize>} - Resolves with the Sequelize instance once the connection is established.
 * @throws {Error} - If the connection to the database fails.
 */
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();

    console.log('🗄️   Database connection has been established successfully.');

    if (config.sync) {
      try {
        await sequelize.sync({ alter: true });
        console.log('🗄️   DB & Model synced successfully!');
      } catch (ex) {
        console.error(`⚠️   Table creation failed: ${ex.message}`);
      }
    }
    return sequelize;
  } catch (ex) {
    console.error(`⚠️   Database connection failed: ${ex.message}`);
  }
};

connectToDatabase();

export { sequelize, Sequelize, DataTypes, Model, Op, connectToDatabase };
