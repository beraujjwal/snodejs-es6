'use strict';
import 'dotenv/config';

import { sendSMS } from '../helpers/sms.js';
import { error } from '../helpers/logger.js';

export const sentOTPSMS = function (email, token) {
  try {
    const smsOptions = {
      email: email,
      otpCode: token,
    };

    sendSMS(smsOptions);
  } catch (ex) {
    error(ex);
  }
};
