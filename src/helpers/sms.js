'use strict';
import 'dotenv/config';
import { BaseError } from '../system/core/error/baseError.js';
import { config } from '../config/sms.config.js';

export const sendSMS = function (smsOptions) {
  console.log(smsOptions);
  return true;
};
