'use strict';

import { Middleware } from './middleware.js';
//import { BaseError } from '../../system/core/error/baseError.js';

import WorkLog from '../services/workLog.service.js';
const workLogService = new WorkLog('WorkLog');

class WorkLogMiddleware extends Middleware {
  /**
   * Controller constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
  }

  /**
   *
   * @param {*} action
   * @param {*} module
   * @returns
   */
  createWorkLog(action, module, dataSource = null, field = null) {
    return async function (req, res, next) {
      try {
        const decoded = req.user;
        const userID = decoded.id;
        const { 'x-device-id': deviceId } = req.headers;
        let referenceID = null;
        if (dataSource) referenceID = req[dataSource][field];
        const { files, body, query, params } = req;
        const data = { files, body, query, params };
        workLogService.createWorkLog(
          { userID, module, action, referenceID, deviceId, data },
          { transaction: null }
        );

        //updateActivityBySessionId(sessionID, { userID, module, action, referenceID, deviceId }, { transaction: null })
        next();
        return;
      } catch (ex) {
        ex.code = 403;
        next(ex);
      }
    };
  }
}

export default new WorkLogMiddleware();
