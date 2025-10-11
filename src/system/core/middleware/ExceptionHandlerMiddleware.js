'use strict';
import fs from 'fs';
import path from 'path';

import Base from '../base/index.js';

import { response } from '../helpers/apiResponse.js';
import { sequelize } from '../../database/db.js';
import { BaseError } from '../error/baseError.js';

import { error } from '../../../helpers/logger.js';

class ExceptionHandlerMiddleware extends Base {
  constructor(controllerFunction) {
    super();
    this.controllerFunction = controllerFunction;
  }

  async handle(req, res, next) {
    let transaction;
    try {
      transaction = await sequelize.transaction();
      const { browser, version, os, platform } = req.useragent;
      const {
        'x-device-id': deviceId,
        'x-device-type': deviceType,
        'x-device-fcm-token': fcmToken,
      } = req.headers;

      if (!deviceId || !deviceType) throw new Error('Unknown device.');

      const ip = req.headers['x-forwarded-for']
        ? req.headers['x-forwarded-for'].split(',')[0] // Get the first IP in the list
        : req.connection.remoteAddress;
      const ipv4 = ip.includes(':') ? ip.split(':').pop() : ip;

      const deviceInfo = {
        browser,
        version,
        os,
        platform,
        deviceId,
        deviceType,
        fcmToken,
        ip: ipv4,
      };

      const { files, body, query, params, user } = req;
      //await this.controllerFunction(req, res, next);
      const result = await this.controllerFunction(
        { files, body, query, params },
        { transaction, user, deviceInfo }
      );

      // If controller returns a file to download
      if (result?.filePath) {
        const filePath = result.filePath;
        const fileName = path.basename(filePath);

        return res.download(filePath, fileName, (ex) => {
          if (ex) throw new BaseError(ex.message || 'Error downloading file', 500);

          // ✅ Delete after download
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) console.error('❌ Error deleting file:', unlinkErr);
            else console.log('🗑️ Deleted file:', filePath);
          });
        });
      }

      const resultStructure = {
        code: result.code,
        error: false,
        message: result.message,
        data: result.result,
      };
      if (transaction) await transaction.commit();
      return res.status(result.code).json(response(resultStructure));
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      if (transaction) await transaction.rollback();
      next(mapSequelizeError(ex));
    }
  }
}

export default ExceptionHandlerMiddleware;

const mapSequelizeError = (error) => {
  const messages = {
    SequelizeUniqueConstraintError: [409, 'Unique constraint violation.'],
    SequelizeDatabaseError: [500, 'Database error occurred.'],
    SequelizeConnectionError: [500, 'Database connection error.'],
    SequelizeTimeoutError: [500, 'Database operation timed out.'],
    SequelizeForeignKeyConstraintError: [400, 'Invalid role provided.'],
    SequelizeValidationError: [400, 'Invalid input data.'],
    SequelizeConnectionRefusedError: [500, 'Database connection refused.'],
    SequelizeAccessDeniedError: [403, 'Access denied to the database.'],
    SequelizeHostNotFoundError: [500, 'Database host not found.'],
    SequelizeHostNotReachableError: [500, 'Database host not reachable.'],
    SequelizeInvalidConnectionError: [500, 'Invalid database connection.'],
    SequelizeConnectionTimedOutError: [500, 'Database connection timed out.'],
    SequelizeConnectionLimitError: [500, 'Database connection limit exceeded.'],
    SequelizeDatabaseNotFoundError: [404, 'Database not found.'],
    SequelizeInvalidValueError: [400, 'Invalid value provided.'],
    SequelizeEmptyResultError: [404, 'No results found.'],
    SequelizeInvalidQueryError: [400, 'Invalid query provided.'],
    SequelizeDatabaseBusyError: [503, 'Database is busy.'],
    SequelizeInvalidParameterError: [400, 'Invalid parameter provided.'],
    SequelizeInvalidModelError: [400, 'Invalid model provided.'],
  };

  if (messages[error.name]) {
    const [code, message] = messages[error.name];
    return new BaseError(message, code);
  }

  if (error instanceof BaseError) return error;
  if (error instanceof Error) return new BaseError(error.message, 500);
  return new BaseError('Some error occurred while processing your request.', 500);
};
