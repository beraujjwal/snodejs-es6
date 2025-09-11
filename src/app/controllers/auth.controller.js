'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import Controller from './controller.js';

import User from '../services/user.service.js';
import UserDevice from '../services/userDevice.service.js';
import Token from '../services/token.service.js';

import { registrationVerificationEmail } from '../../libraries/email.library.js';
import { encrypt, decrypt } from '../../helpers/encodeDecode.js';

import {
  keyExists,
  setValue,
  getValue,
  deleteValue,
} from '../../libraries/redis.library.js';

class AuthController extends Controller {
  /**
   * Controller constructor
   * @author Ujjwal Bera
   * @param {service} service - Service layer object
   */
  constructor(service) {
    super(service);
    this.service = service;
  }

  get userDeviceService() {
    if (!this._userDeviceService) {
      this._userDeviceService = UserDevice.getInstance('UserDevice');
    }
    return this._userDeviceService;
  }

  get tokenService() {
    if (!this._tokenService) {
      this._tokenService = Token.getInstance('Token');
    }
    return this._tokenService;
  }

  async checkUserExistsByEmail({ body }, { transaction }) {
    const { email, roles } = body;

    const userExists = await this.service.checkUserExistsByEmail(
      { email, roles },
      { transaction }
    );
    let isUserExists = userExists ? true : false;
    return {
      code: 200,
      result: { userExists: isUserExists },
      message: 'User exists checked successfully!',
    };
  }

  /**
   * @desc Registers a new user with the provided details
   * @param {Object} body - The request body containing name, email, phone, password, and roles
   * @param {Object} transaction - The transaction object for database operations
   * @returns {Object} An object containing the status code, result, and message
   * @throws {baseError} If the registration process fails
   */
  async signup({ body }, { transaction }) {
    const { first_name, last_name, email, ext, phone, roles, password } = body;

    const user = await this.service.signup(
      { first_name, last_name, email, ext, phone, password, roles },
      { transaction }
    );
    if (!user)
      throw new BaseError(
        'Some error occurred while creating user account. Please try again.',
        500
      );

    await this.tokenService.createToken(
      {
        userId: user.user.id,
        sentFor: 'ACTIVATION',
        sentOn: user.user.email,
      },
      { transaction }
    );
    if (user) {
      return {
        code: 201,
        result: user,
        message: 'User created successfully!',
      };
    }
    throw new BaseError(
      'Some error occurred while verify your account. Please try again.',
      500
    );
  }

  async verificationTenantAccount({ params }, { transaction }) {
    const { identifier, verificationToken } = params;
    const email = decrypt(identifier);
    const token = decrypt(verificationToken);

    const verificationTokenResult = await this.tokenService.verificationToken(
      email,
      token,
      { transaction }
    );
    if (!verificationTokenResult)
      throw new BaseError('Invalid varification.', 403);

    const userInfo = await this.service.verifyTenantAccount(
      verificationTokenResult.userID,
      { transaction }
    );

    if (userInfo) {
      return {
        code: 200,
        result: userInfo,
        message: 'Your account activated successfully!',
      };
    }
    throw new BaseError(
      'Some error occurred while verify your account. Please try again.',
      500
    );
  }

  /**
   * @desc Verify user by token
   * @param {Object} body - The request body containing username and token
   * @param {Object} transaction - The transaction object for database operations
   * @returns {Object} An object containing the status code, result, and message
   * @throws {baseError} If the verification process fails
   */
  async verify({ body }, { transaction }) {
    const { token, username } = body;
    const result = await userService.verify(username, token, { transaction });
    if (result) {
      return {
        code: 200,
        result,
        message: 'User activated successfully!',
      };
    }
    throw new BaseError(
      'Some error occurred while verify your account. Please try again.',
      500
    );
  }

  /**
   * @desc Authenticates a user and generates a login token
   * @param {Object} body - The request body containing username and password
   * @param {Object} deviceInfo - Information about the user's device
   * @param {Object} transaction - The transaction object for database operations
   * @returns {Object} An object containing the status code, result, and message
   * @throws {baseError} If the login process fails
   */
  async login({ body }, { transaction, deviceInfo }) {
    let message = 'Please complete your signup process!';
    const { username, password } = body;

    const result = await this.service.signin(
      { username, password },
      { transaction }
    );

    const { browser, os, deviceId, deviceType, fcmToken, ip } = deviceInfo;
    const latestUserDevice = await this.userDeviceService.addNewDevice(
      {
        userID: result.user.id,
        userToken: result.token.accessToken,
        fcmToken,
        deviceId,
        deviceType,
        deviceSalt: result.tokenSalt,
        ip,
        os,
        browser,
      },
      { transaction }
    );

    delete result.tokenSalt;
    if (result.token) {
      message = __('LOGIN_SUCCESS');
    } else if (result.user?.isCompleted) {
      message = 'Login token generated successfully!';
    }
    result.user.userDevice = latestUserDevice;

    const userRedisKey = `user-${result.user.id}`;
    setValue(userRedisKey, result.user, this.getEnv('JWT_EXPIRES_IN'));

    //delete result.user.userDevices;
    return {
      code: 200,
      result,
      message,
    };
  }

  /**
   * @desc Verifies a user's OTP and completes the signup process if OTP is valid
   * @param {Object} body - The request body containing username, otp, device_id, device_type and fcm_token
   * @param {Object} transaction - The transaction object for database operations
   * @returns {Object} An object containing the status code, result, and message
   * @throws {baseError} If the verification process fails
   */
  async accountVerificationByOTP({ body, deviceInfo }, { transaction }) {
    let message = 'Please compleat your signup process!';
    const { browser, os, deviceId, deviceType, fcmToken } = deviceInfo;
    const { username, otp } = body;
    const result = await userService.accountVerificationByOTP(
      { username, otp },
      { deviceId, deviceType, fcmToken },
      { transaction }
    );
    if (result) {
      if (result.user.isCompleted) {
        message = 'User login successfully!';
      }
      return {
        code: 200,
        result,
        message,
      };
    }
    throw new BaseError('Some error occurred while login', 500);
  }

  /**
   * @desc Resends the OTP for verification of user account
   * @param {Object} body - The request body containing username and type
   * @param {Object} transaction - The transaction object for database operations
   * @returns {Object} An object containing the status code, result, and message
   * @throws {baseError} If the resending OTP process fails
   */
  async accountVerifyingOTPResend({ body }, { transaction }) {
    let message = 'OTP sent successfully!';
    const { username } = body;
    const result = await userService.accountVerifyingOTPResend(username, {
      transaction,
    });
    if (result) {
      return {
        code: 200,
        result,
        message,
      };
    }

    throw new BaseError('Some error occurred while resending verify OTP.', 500);
  }

  async phoneVerify({ body }, { transaction }) {
    let message = 'Your phone number verified successfully!';
    let { ext, phone, otp } = body;
    let result = await userService.phoneVerify(ext, phone, otp, {
      transaction,
    });
    if (result) {
      return {
        code: 200,
        result,
        message,
      };
    }

    throw new BaseError(
      'Some error occurred while verifying your phone number.',
      500
    );
  }

  async emailVerify({ body }, { transaction }) {
    let message = 'Your email address verified successfully!';
    let { email, otp } = body;
    let result = await userService.emailVerify(email, otp, { transaction });
    if (result) {
      return {
        code: 200,
        result,
        message,
      };
    }

    throw new BaseError(
      'Some error occurred while verifying your email address.',
      500
    );
  }

  async forgotPassword({ body }, { transaction }) {
    let { username } = body;
    let result = await userService.forgotPassword(
      { username },
      { transaction }
    );
    if (result) {
      return {
        code: 200,
        result,
        message: 'Forgot password mail sent successfully!',
      };
    }

    throw new BaseError('Some error occurred while login', 500);
  }

  async reset({ params }, { transaction }) {
    let { user_id, token } = params;
    let result = await userService.verify(user_id, token, { transaction });
    if (result) {
      return {
        code: 200,
        result,
        message: 'User activated successfully!',
      };
    }

    throw new BaseError(
      'Some error occurred while verify your account. Please try again.',
      500
    );
  }

  /**
   * @desc Resets a user's password
   * @param {Object} body - The request body containing username, otp, and password
   * @param {Object} transaction - The transaction object for database operations
   * @returns {Object} An object containing the status code, result, and message
   * @throws {baseError} If the login process fails
   */
  async resetPassword({ body }, { transaction }) {
    let { username, otp, password } = body;
    let result = await userService.resetPassword(
      { username, otp, password },
      { transaction }
    );
    if (result) {
      return {
        code: 200,
        result,
        message: 'User password reset successfully!',
      };
    }

    throw new BaseError(
      'Some error occurred while verify your account. Please try again.',
      500
    );
  }

  async generateToken({ body }, { transaction }) {
    let { token } = body;
    let result = await userService.generateTokenFromRefreshToken(
      { token },
      { transaction }
    );
    if (result) {
      return {
        code: 200,
        result,
        message: 'Token generated successfully!',
      };
    }

    throw new BaseError('Some error occurred while generating token.', 500);
  }

  async logout({ user, deviceInfo }, { transaction }) {
    const result = await this.service.logout(
      { user, deviceInfo },
      { transaction }
    );

    const userRedisKey = `user-${user.id}`;
    deleteValue(userRedisKey);
    if (result) {
      return {
        code: 200,
        result,
        message: 'User logged out successfully!',
      };
    }

    throw new BaseError('Some error occurred while logging out.', 500);
  }
}

const userService = User.getInstance('User');
// const userDeviceService = UserDevice.getInstance('UserDevice');
// const tokenService = Token.getInstance('Token');

export default new AuthController(userService);
