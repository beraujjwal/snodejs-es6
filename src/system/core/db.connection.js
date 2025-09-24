'use strict';
import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import { sequelize } from '../database/db.js';
import config from '../../config/db.config.js';
import { info, error } from '../../helpers/logger.js';

/**
 * Establishes a connection to the database.
 *
 * @returns {Promise<Sequelize>} - Resolves with the Sequelize instance once the connection is established.
 * @throws {Error} - If the connection to the database fails.
 */
const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();

    info('🗄️   Database connection has been established successfully.');

    if (config.sync) {
      try {
        await sequelize.sync({ alter: true });
        info('🗄️   DB & Model synced successfully!');
      } catch (ex) {
        error(`⚠️   Table creation failed: ${ex.message}`);
      }
    }
    return sequelize;
  } catch (ex) {
    error(`⚠️   Database connection failed: ${ex.message}`);
  }
};

connectToDatabase();

export { sequelize, Sequelize, DataTypes, Model, Op, connectToDatabase };
