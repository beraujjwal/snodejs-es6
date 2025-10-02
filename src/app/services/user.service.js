'use strict';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

import Service from './service.js';
import { BaseError } from '../../system/core/error/baseError.js';
import Token from './token.service.js';
import Role from './role.service.js';

import { encrypt, decrypt } from '../../helpers/encodeDecode.js';

import {
  generateOTP,
  generateToken,
  generateRefreshToken,
  getExpiresInTime,
} from '../../helpers/utility.js';

class User extends Service {
  /**
   * @description User service constructor
   * @author Ujjwal Bera
   * @param { string }: model
   * @returns { object } : User service object
   * @throws null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.name = model;
  }

  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new User(model);
    }
    return this.instances[model];
  }

  get role() {
    if (!this.modelInstances['Role']) {
      this.modelInstances['Role'] = this.getModel('Role');
    }
    return this.modelInstances['Role'];
    //return this.getModel('Role');
  }

  get permission() {
    if (!this.modelInstances['Permission']) {
      this.modelInstances['Permission'] = this.getModel('Permission');
    }
    return this.modelInstances['Permission'];
    // return this.getModel('Permission');
  }

  get resource() {
    if (!this.modelInstances['Resource']) {
      this.modelInstances['Resource'] = this.getModel('Resource');
    }
    return this.modelInstances['Resource'];
    // return this.getModel('Resource');
  }

  get userDevice() {
    if (!this.modelInstances['UserDevice']) {
      this.modelInstances['UserDevice'] = this.getModel('UserDevice');
    }
    return this.modelInstances['UserDevice'];
    // return this.getModel('UserDevice');
  }

  get userRole() {
    if (!this.modelInstances['UserRole']) {
      this.modelInstances['UserRole'] = this.getModel('UserRole');
    }
    return this.modelInstances['UserRole'];
    // return this.getModel('UserRole');
  }

  get tokenService() {
    if (!this._tokenService) {
      this._tokenService = Token.getInstance('Token');
    }
    return this._tokenService;
  }

  get roleService() {
    if (!this._roleService) {
      this._roleService = Role.getInstance('Role');
    }
    return this._roleService;
  }

  async checkUserExistsByEmail({ email, roles }, { transaction }) {
    try {
      const include = [];
      if (roles && roles.length > 0) {
        include.push({
          model: this.role,
          as: 'roles',
          where: { slug: { [Op.in]: roles } },
        });
      }
      const userExists = await this.model.findOne({
        where: { email },
        include: include,
        transaction,
      });
      return userExists;
    } catch (error) {
      console.error(error);
      throw new BaseError(error);
    }
  }

  async checkUserExistsByPhone({ phone, roles }, { transaction }) {
    const userExists = await this.model.findOne({
      where: { phone },
      include: [
        {
          model: this.role,
          as: 'roles',
          where: { slug: { [Op.in]: roles } },
        },
      ],
      transaction,
    });
    return userExists;
  }

  /**
   * @description Attempt to user signup service with the provided object
   * @author Ujjwal Bera
   * @param req object
   * @param res object
   * @return json object
   */
  async signup({ first_name, last_name, email, ext, phone, password, roles }, { transaction }) {
    try {
      //Registering new user
      if (!roles) throw new BaseError('INVALID_ROLES_SELECTED');

      // const tokenSalt = generateOTP(6, { digits: true });
      console.log('this.model', this.model.associations);
      console.log('data', {
        first_name,
        last_name,
        ext,
        phone,
        email,
        password,
        isCompleted: false,
        status: true,
        verified: { email: false, phone: false },
      });
      const user = await this.model.create(
        {
          first_name,
          last_name,
          ext,
          phone,
          email,
          isCompleted: false,
          status: true,
          verified: { email: false, phone: false },
          password,
        },
        { transaction }
      );

      const userId = user.id;

      const userRoles = await this.roleService.createUserRole({ userId, roles }, { transaction });

      let signupRes = { user, roles: userRoles };
      return signupRes;
    } catch (ex) {
      console.error(ex.stack);
      throw new BaseError(ex);
    }
  }

  /**
   * @description Attempt to user login with the provided object
   * @param req {object} Object containing all required fields to do user login
   * @param res {object} Object containing all required fields to do user login
   * @returns {Promise<{success: boolean, error: *}|{success: boolean, data: *}>}
   */
  async signin({ username, password }, { transaction }) {
    // eslint-disable-next-line no-useless-escape
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    try {
      const criteria = username.match(regexEmail)
        ? {
            email: username,
            verified: {
              email: true,
            },
            status: true,
          }
        : {
            phone: username,
            verified: {
              phone: true,
            },
            status: true,
          };

      const user = await this.getUserDetails(criteria, { transaction });
      if (!user) throw new BaseError('LOGIN_INVALID_USERNAME_PASSWORD', 401);

      await this.blockLoginAttempts(user?.blockExpires);

      const passwordIsValid = bcrypt.compareSync(password, user?.password);

      if (!passwordIsValid) {
        await this.invalidLoginAttempt(user, transaction);
      }

      const roles = [];
      for await (const role of user.roles) {
        roles.push(role.slug);
      }

      const tokenSalt = generateOTP(6, { digits: true });
      const accessToken = generateToken({
        id: user.id,
        ext: user.ext,
        phone: user.phone,
        email: user.email,
        roles: roles,
        tokenSalt,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        tokenSalt,
      });

      const token = {
        tokenType: 'Bearer',
        accessToken: encrypt(accessToken),
        refreshToken: encrypt(refreshToken),
        expiresIn: await getExpiresInTime(),
      };

      //const userWithLatestData = { ...user, ...data };
      delete user.password;
      delete user.loginAttempts;
      delete user.blockExpires;
      const loginRes = {
        user: user,
        roles,
        token,
        tokenSalt,
      };

      return loginRes; //.toJson();
    } catch (ex) {
      throw new BaseError(ex.message, ex.code);
    }
  }

  async verifyTenantAccount(userID, { transaction }) {
    try {
      const data = {
        isEmailVerified: true,
        verified: true,
        status: true,
      };
      const updateResult = await this.model.update(
        data,
        { where: { id: userID } },
        { transaction }
      );
      if (updateResult[0] == 1) {
        const currentUser = await this.model.findOne({ where: { id: userID } }, { transaction });
        return JSON.parse(JSON.stringify(currentUser));
      }

      return false;
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while login into your account. Please try again.',
        ex.status
      );
    }
  }

  async accountVerifyingOTPResend(username, { transaction }) {
    // eslint-disable-next-line no-useless-escape
    const regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    try {
      //Finding user with set criteria
      const criteria = username.match(regexEmail)
        ? {
            email: username,
            status: true,
          }
        : {
            phone: username,
            status: true,
          };

      const user = await this.getUserDetailsOnly(criteria, {
        transaction,
        userOnly: true,
      });

      if (!user) throw new BaseError('We are unable to find your account with the given details.');

      if (user && user?.verified) throw new BaseError('You account already verified.');

      await this.tokenService.createToken(
        { userId: user.id, sentFor: 'ACTIVATION', sentOn: username },
        transaction
      );

      return true;
    } catch (ex) {
      throw new BaseError(
        ex.message || 'An error occurred while login into your account. Please try again.',
        ex.status
      );
    }
  }

  async generateTokenFromRefreshToken({ token }, { transaction }) {
    try {
      // Verify the refresh token first
      const decoded = jwt.verify(decrypt(token), this.getEnv('JWT_REFRESH_TOKEN_SECRET'));

      const criteria = {
        id: decoded.id,
        status: true,
        verified: true,
      };

      const user = await this.getUserDetails(criteria, { transaction });
      if (!user) throw new BaseError('LOGIN_INVALID_USERNAME_PASSWORD', 401);

      await this.blockLoginAttempts(user?.blockExpires);

      const roles = [];
      for await (const role of user.roles) {
        roles.push(role.slug);
      }

      const accessToken = generateToken({
        id: user.id,
        ext: user.ext,
        phone: user.phone,
        email: user.email,
        roles: roles,
        tokenSalt: decoded.tokenSalt,
      });

      const refreshToken = generateRefreshToken({
        id: user.id,
        tokenSalt: decoded.tokenSalt,
      });

      return {
        tokenType: 'Bearer',
        accessToken: encrypt(accessToken),
        refreshToken: encrypt(refreshToken),
        expiresIn: await getExpiresInTime(),
      };
    } catch (ex) {
      throw new BaseError(ex.message || 'Invalid or expired refresh token.', 401);
    }
  }

  async invalidLoginAttempt(user, transaction) {
    try {
      let blockLoginAttempts = parseInt(this.getEnv('BLOCK_LOGIN_ATTEMPTS'));
      const loginAttempts = user?.loginAttempts ? parseInt(user.loginAttempts) : 0;
      const filter = { id: user.id };
      let data = { loginAttempts: loginAttempts + 1 };
      if (loginAttempts >= blockLoginAttempts) {
        let blockExpires = new Date(Date.now() + 60 * 5 * 1000);
        data = { ...data, loginAttempts: 0, blockExpires };
      }
      await this.model.update(
        data,
        {
          where: filter,
        },
        { transaction }
      );

      if (loginAttempts >= blockLoginAttempts) {
        throw new BaseError('Your login attempts exist. Please try after 300 seconds.', 401);
      } else {
        throw new BaseError('You have submitted invalid login details.', 401);
      }
    } catch (ex) {
      throw new BaseError(ex.message || 'INVALID_LOGIN_ATTEMPT', ex.status);
    }
  }

  async blockLoginAttempts(blockExpires) {
    try {
      const currentDateTime = moment().utc(this.getEnv('APP_TIMEZONE')).toDate();
      if (blockExpires > currentDateTime) {
        let tryAfter =
          (new Date(blockExpires).getTime() - new Date(currentDateTime).getTime()) / 1000;
        throw new BaseError(
          `Your login attempts exist. Please try after ${Math.round(tryAfter)} seconds`
        );
      }
    } catch (ex) {
      throw new BaseError(ex.message || 'INVALID_LOGIN_ATTEMPT', ex.status);
    }
  }

  async getUserDetails(criteria, { transaction, userOnly = false }) {
    try {
      let user = await this.model.findOne({
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt', 'isEmailVerified', 'isPhoneVerified'],
        },
        where: criteria,
        include: [
          {
            model: this.role,
            as: 'roles',
            attributes: {
              exclude: ['createdAt', 'updatedAt', 'deletedAt'],
            },
            required: true,
            through: {
              attributes: [],
            },
            where: {
              status: true,
            },
          },
        ],
        transaction,
        //lock: true,
        //skipLocked: true,
      });

      if (!user)
        throw new BaseError('We are unable to find your account with the given details.', 401);

      if (!userOnly) {
        user = user.toJSON();
        const allRoles = user.roles;

        if (allRoles.length === 0) throw new BaseError('User has no roles.', 400);

        const rolesWithDetails = await Promise.all(
          allRoles.map(async (role) => {
            const resources = await this.resource.unscoped().findAll({
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'deletedAt'],
              },
              where: {
                status: true,
              },
              include: [
                {
                  model: this.permission.unscoped(),
                  as: 'resourceRolePermissions',
                  attributes: {
                    exclude: ['createdAt', 'updatedAt', 'deletedAt'],
                  },
                  where: {
                    status: true,
                  },
                  through: {
                    where: { roleID: role.id, status: true },
                    attributes: [], // To exclude the join table attributes
                  },
                },
              ],
              transaction,
              lock: true,
              skipLocked: true,
            });
            role.resources = resources;
            return role;
          })
        );

        const resources = await this.resource.unscoped().findAll({
          attributes: {
            exclude: ['createdAt', 'updatedAt', 'deletedAt'],
          },
          where: {
            status: true,
          },
          include: [
            {
              model: this.permission.unscoped(),
              as: 'resourceUserPermissions',
              attributes: {
                exclude: ['createdAt', 'updatedAt', 'deletedAt'],
              },
              where: {
                status: true,
              },
              through: {
                where: { userID: user.id, status: true },
                attributes: [], // To exclude the join table attributes
              },
            },
          ],
          transaction,
          lock: true,
          skipLocked: true,
        });

        user.roles = rolesWithDetails;
        user.resources = resources;
      }

      return user;
    } catch (ex) {
      console.error(ex);
      throw new BaseError(ex.message, ex.code);
    }
  }

  async logout({ user, deviceInfo }, { transaction }) {
    try {
      await this.userDevice.update(
        { status: false, deviceSalt: null },
        {
          where: {
            userID: user.id,
            status: true,
            deviceId: deviceInfo.deviceId,
          },
          transaction,
        }
      );
      return user;
    } catch (ex) {
      console.error(ex);
      throw new BaseError(ex.message, ex.code);
    }
  }
}

export default User;
