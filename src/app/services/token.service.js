'use strict';
import moment from 'moment';
import { Op } from 'sequelize';
//import autoBind from '../../system/autobind';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

import {
  generateOTP,
  generateToken,
  generateRefreshToken,
  getExpiresInTime,
} from '../../helpers/utility.js';

import { sentOTPMail } from '../../libraries/email.library.js';
import { sentOTPSMS } from '../../libraries/sms.library.js';
import { encrypt, decrypt } from '../../helpers/encodeDecode.js';

class Token extends Service {
  /**
   * services constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  }

  static getInstance(model) {
    if (!this.instance) {
      this.instance = new Token(model);
    }
    return this.instance;
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
      console.log(ex);
      throw new BaseError(ex);
    }
  }

  async findOtp(userId, otp, type, sentOn) {
    try {
      let cutoff = moment().utc(this.env.APP_TIMEZONE).toDate();
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
        expiresAt: moment().utc(this.env.APP_TIMEZONE).toDate(),
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
      console.log('ex', ex);
      throw new BaseError(ex);
    }
  }

  async findUpdateOrCreate(userId, type, sentOn) {
    try {
      let isEmail = sentOn.match(this.regexEmail) ? true : false;
      let sentTo = 'phone';
      const currentDateTime = moment().utc(this.env.APP_TIMEZONE).toDate();
      const expiresAt = moment()
        .utc(this.env.APP_TIMEZONE)
        .add(5, 'm')
        .toDate();

      if (isEmail) {
        sentTo = 'email';
      }

      let cutoff = currentDateTime;
      let tokenCriteria = {
        user: userId,
        status: true,
        type: type,
        sent_on: sentOn,
        expiresAt: { $gt: cutoff },
      };
      let otpResponse = await this.model
        .findOne(tokenCriteria)
        .session(session);

      const otpToken = await this.generateOTP(6, {
        digits: true,
      });

      if (otpResponse) {
        let filter = { _id: otpResponse._id };
        await this.model
          .updateOne(filter, {
            $set: {
              token: otpToken,
              expiresAt: expiresAt,
            },
          })
          .session(session);

        otpResponse.token = otpToken;
        otpResponse.expiresAt = expiresAt;
        return otpResponse;
      }

      let userToken = await this.model.create(
        {
          user: userId,
          token: otpToken,
          type: type,
          sent_to: sentTo,
          sent_on: sentOn,
          status: true,
          expiresAt: expiresAt,
        },
        { session: session }
      );

      return userToken;
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  async generateTokenFromRefreshToken({ token }, { transaction }) {
    try {
      // Verify the refresh token first
      const decoded = jwt.verify(
        decrypt(token),
        this.getEnv('JWT_REFRESH_TOKEN_SECRET')
      );

      console.log('decoded', decoded);

      // You can optionally revalidate user from DB here using decoded.userId/email

      // Generate a new access token
      const accessToken = jwt.sign(
        { userId: decoded.userId }, // or whatever payload you use
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' } // Short-lived access token
      );

      return accessToken;
    } catch (err) {
      console.log('err', err);
      throw new BaseError('Invalid or expired refresh token.', 401);
    }
  }
}

export default Token;
