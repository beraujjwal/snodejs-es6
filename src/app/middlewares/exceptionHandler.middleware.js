'use strict';
import 'dotenv/config';

import { response } from '../../system/core/helpers/apiResponse.js';
import { sequelize } from '../../system/core/db.connection.js';

export const exceptionHandler = (controllerFunction) => {
  return async (req, res, next) => {
    const transaction = await sequelize.transaction();
    try {
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

      const { body, query, params, user } = req;
      const result = await controllerFunction(
        { body, query, params, user, deviceInfo },
        { transaction }
      );
      const resultStructure = {
        code: result.code,
        error: false,
        message: result.message,
        data: result.result,
      };
      if (transaction) await transaction.commit();
      return res.status(result.code).json(response(resultStructure));
    } catch (ex) {
      console.log('ex', ex);
      if (transaction) await transaction.rollback();
      next(ex);
    } finally {
      //if (transaction) await transaction.end();
    }
  };
};
