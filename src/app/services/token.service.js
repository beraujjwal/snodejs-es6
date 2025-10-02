'use strict';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

import { generateOTP } from '../../helpers/utility.js';

import { sentOTPMail } from '../../libraries/email.library.js';
import { sentOTPSMS } from '../../libraries/sms.library.js';
import { decrypt } from '../../helpers/encodeDecode.js';

class Token extends Service {
  /**
   * @description Token service constructor
   * @author Ujjwal Bera
   * @param { string }: model
   * @returns { object } : Token service object
   * @throws null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.name = model;
    this.regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  }

  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new Token(model);
    }
    return this.instances[model];
  }

  async verificationToken(email, token, { transaction }) {
    try {
      const cutoff = moment().utc(this.getEnv('APP_TIMEZONE')).toDate();
      const tokenCriteria = {
        token: token,
        status: true,
        sentOn: email,
        sentFor: 'ACTIVATION',
        expireAt: {
          [Op.gt]: cutoff,
        },
      };
      const tokenData = await this.model.findOne(
        {
          where: tokenCriteria,
        },
        { transaction }
      );

      if (!tokenData) throw new BaseError('Invalid token.', 403);
      const updatedData = {
        status: false,
        expireAt: moment().utc(this.getEnv('APP_TIMEZONE')).toDate(),
      };
      await tokenData.update(updatedData, { transaction });
      return JSON.parse(JSON.stringify(tokenData));
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  async findOtp(userId, otp, type, sentOn) {
    try {
      let cutoff = moment().utc(this.getEnv('APP_TIMEZONE')).toDate();
      let tokenCriteria = {
        user: userId,
        token: otp,
        status: true,
        type: type,
        sent_on: sentOn,
        expiresAt: { $gt: cutoff },
      };
      return await this.model.findOne(tokenCriteria);
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  async deactiveOtp(Id) {
    try {
      let data = {
        status: false,
        expiresAt: moment().utc(this.getEnv('APP_TIMEZONE')).toDate(),
        token: null,
      };
      let filter = { _id: Id };
      await this.model.updateOne(filter, { $set: data });
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  async createToken({ userId, sentFor, sentOn }, { transaction }) {
    try {
      const isEmail = sentOn.match(this.regexEmail) ? true : false;
      let sentTo = 'PHONE';

      if (isEmail) sentTo = 'EMAIL';

      this.model.update(
        {
          status: false,
          expireAt: moment().utc(this.getEnv('APP_TIMEZONE')).toDate(),
        },
        {
          where: {
            status: true,
            userID: userId,
          },
        },
        { transaction }
      );
      let expireAtTimeInMinute = 5;
      let otpToken = null;
      if (sentFor === 'ACTIVATION') {
        otpToken = generateOTP(15, {
          digits: true,
          lowerCase: true,
          upperCase: true,
          specialChars: true,
        });
        expireAtTimeInMinute = 1440;
      } else {
        otpToken = generateOTP(6, {
          digits: true,
        });
      }

      const userToken = await this.model.create(
        {
          userID: userId,
          token: otpToken,
          sentFor: sentFor,
          sentTo: sentTo,
          sentOn: sentOn,
          status: true,
          expireAt: moment()
            .utc(this.getEnv('APP_TIMEZONE'))
            .add(expireAtTimeInMinute, 'm')
            .toDate(),
        },
        { transaction }
      );
      if (isEmail) sentOTPMail(sentOn, otpToken);
      else sentOTPSMS(sentOn, otpToken);

      return userToken;
    } catch (ex) {
      throw new BaseError(ex);
    }
  }
}

export default Token;
