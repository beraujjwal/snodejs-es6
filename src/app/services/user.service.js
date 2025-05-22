'use strict';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import jwt from 'jsonwebtoken';

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

const tokenService = Token.getInstance('Token');
const roleService = Role.getInstance('Role');

class User extends Service {
  /**
   * Service constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
    this.role = this.getModel('Role');
    this.permission = this.getModel('Permission');
    this.resource = this.getModel('Resource');
    this.userDevice = this.getModel('UserDevice');
    this.userRole = this.getModel('UserRole');
  }

  static getInstance(model) {
    if (!this.instance) {
      this.instance = new User(model);
    }
    return this.instance;
  }

  async createTenantUser(
    { first_name, last_name, email, ext, phone, password, roles, timezone },
    { transaction }
  ) {
    try {
      const user = await this.model.create(
        {
          first_name,
          last_name,
          ext,
          phone,
          email,
          password,
          status: true,
          verified: { email: true, phone: true },
          timezone,
        },
        { transaction }
      );

      const userId = user.id;
      const userRoles = await roleService.createUserRole(
        { userId, roles },
        { transaction }
      );

      return JSON.parse(JSON.stringify({ user, roles: userRoles }));
    } catch (ex) {
      console.error(ex);
      throw new BaseError(ex);
    }
  }

  async tenantSignup(
    {
      first_name,
      last_name,
      email,
      ext,
      phone,
      organization,
      domain,
      password,
    },
    { transaction }
  ) {
    try {
      const user = await this.model.create(
        {
          first_name,
          last_name,
          ext,
          phone,
          email,
          password,
          status: false,
          verified: JSON.stringify({ email: false, phone: false }),
        },
        { transaction }
      );

      const userId = user.id;
      const userRoles = await roleService.createUserRole(
        { userId, roles: ['tenant'] },
        transaction
      );

      let signupRes = { user, roles: userRoles };
      return signupRes;
    } catch (ex) {
      console.error(ex);
      throw new BaseError(ex);
    }
  }

  /**
   * @description Attempt to user signup service with the provided object
   * @author Ujjwal Bera
   * @param req object
   * @param res object
   * @return json object
   */
  async signup(
    { first_name, last_name, email, ext, phone, password, roles },
    transaction
  ) {
    try {
      //Registering new user
      if (!roles) throw new BaseError(__('INVALID_ROLES_SELECTED'));

      const tokenSalt = generateOTP(6, { digits: true });
      const user = await this.model.create(
        {
          first_name,
          last_name,
          ext,
          phone,
          email,
          password,
          isCompleted: true,
          status: true,
          verified: JSON.stringify({}),
          tokenSalt,
        },
        { transaction }
      );

      const userId = user.id;
      const sentOn = email || phone;
      await tokenService.createToken(
        { userId, sentFor: 'ACTIVATION', sentOn },
        transaction
      );
      const userRoles = await roleService.createUserRole(
        { userId, roles },
        transaction
      );

      let signupRes = { user, roles: userRoles };
      return signupRes;
    } catch (ex) {
      console.error(ex);
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
      if (!user)
        throw new BaseError(__('LOGIN_INVALID_USERNAME_PASSWORD'), 401);

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
        currentDateTime: moment().utc(this.getEnv('APP_TIMEZONE')).toDate(),
      };

      const filter = { id: user.id };
      const data = {
        loginAttempts: 0,
        blockExpires: moment().utc(this.getEnv('APP_TIMEZONE')).toDate(),
      };

      this.model.update(data, { where: filter }, { transaction });

      const userWithLatestData = { ...user, ...data };
      delete userWithLatestData.password;
      const loginRes = {
        user: userWithLatestData,
        roles,
        token,
        tokenSalt,
      };

      return loginRes; //.toJson();
    } catch (ex) {
      console.log('ex', ex);
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
        const currentUser = await this.model.findOne(
          { where: { id: userID } },
          { transaction }
        );
        return JSON.parse(JSON.stringify(currentUser));
      }
      console.log('updateResult', updateResult);
      return false;
    } catch (ex) {
      throw new BaseError(
        ex.message ||
          'An error occurred while login into your account. Please try again.',
        ex.status
      );
    }
  }

  async accountVerifyingOTPResend(username, { transaction }) {
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

      if (!user)
        throw new BaseError(
          'We are unable to find your account with the given details.'
        );

      if (user && user?.verified)
        throw new BaseError('You account already verified.');

      await tokenService.createToken(
        { userId: user.id, sentFor: 'ACTIVATION', sentOn: username },
        transaction
      );

      return true;
    } catch (ex) {
      throw new BaseError(
        ex.message ||
          'An error occurred while login into your account. Please try again.',
        ex.status
      );
    }
  }

  /**
   * @description Attempt to user activate with the provided object
   * @param req {object} Object containing all required data to do user activate
   * @param res {object}
   * @returns {Promise<{success: boolean, error: *}|{success: boolean, data: *}>}
   */
  async activateService(req, res) {
    var username = req.params.username;
    var token = req.params.token;
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var criteria = username.match(regexEmail)
      ? { email: username }
      : { phone: username };

    try {
      var user = await this.User.findOne({
        where: criteria,
      });

      if (user == null) {
        throw new Error(`User not found.`);
      }

      if (user.verified) {
        throw new Error(`User already verified.`);
      }

      var foundToken = await this.VerificationToken.findOne({
        where: { token: token, type: 'signup', status: true },
      });

      if (foundToken == null) {
        throw new Error(`Verification token not found.`);
      }

      await user.update({ verified: true }).catch((ex) => {
        throw new Error(ex);
      });

      await foundToken.update({ status: false }).catch((ex) => {
        throw new Error(ex);
      });

      //`User with ${inputDetails.field} ${inputDetails.value} has been verified`

      var activateRes = {
        status: true,
        message: `Your Account has been activated successfully.`,
      };
      return activateRes;
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async resetPasswordService(req, res) {
    const username = req.body.username;
    let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var criteria = username.match(regexEmail)
      ? { email: username }
      : { phone: username };
    try {
      var user = await this.User.findOne({
        where: criteria, //checking if the email address or phone sent by client is present in the db(valid)
      });

      if (user == null) {
        throw new Error(`User not found.`);
      }

      var verificationToken = await this.VerificationToken.findOne({
        where: { user_id: user.id, type: 'reset_password' },
      });

      if (verificationToken != null) {
        this.VerificationToken.destroy({
          where: {
            id: verificationToken.id,
          },
        });
      }

      var token = this.crypto.randomBytes(64).toString('hex'); //creating the token to be sent to the forgot password form (react)
      bcrypt.hash(token, null, null, function (err, hash) {
        //hashing the password to store in the db node.js
        console.log(this.getEnv('RESET_PASSWORD_TOKEN_EXPIRES_IN'));
        var dt = new Date();
        dt.setSeconds(
          dt.getSeconds() +
            parseInt(this.getEnv('RESET_PASSWORD_TOKEN_EXPIRES_IN'))
        );
        this.VerificationToken.create({
          user_id: user.id,
          token: hash,
          type: 'reset_password',
          status: true,
          expire_at: dt,
        }).then(function (item) {
          if (!item)
            return throwFailed(
              res,
              'Oops problem in creating new password record'
            );
          let mailOptions = {
            to: user.email,
            subject: 'Reset your account password',
            html:
              '<h4><b>Reset Password</b></h4>' +
              '<p>To reset your password, complete this form:</p>' +
              '<a href=' +
              config.clientUrl +
              'reset/' +
              user.id +
              '/' +
              token +
              '">' +
              config.clientUrl +
              'reset/' +
              user.id +
              '/' +
              token +
              '</a>' +
              '<br><br>' +
              '<p>--Team</p>',
          };

          this.mailer.send(mailOptions);

          let mailSent = sendMail(mailOptions); //sending mail to the user where he can reset password.User id and the token generated are sent as params in a link
          if (mailSent) {
            return res.json({
              success: true,
              message: 'Check your mail to reset your password.',
            });
          } else {
            return throwFailed(error, 'Unable to send email.');
          }
        });
      });
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async generateTokenFromRefreshToken({ token }, { transaction }) {
    try {
      // Verify the refresh token first
      const decoded = jwt.verify(
        decrypt(token),
        this.getEnv('JWT_REFRESH_TOKEN_SECRET')
      );

      const criteria = {
        id: decoded.id,
        status: true,
        verified: true,
      };

      const user = await this.getUserDetails(criteria, { transaction });
      if (!user)
        throw new BaseError(__('LOGIN_INVALID_USERNAME_PASSWORD'), 401);

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
        currentDateTime: moment().utc(this.getEnv('APP_TIMEZONE')).toDate(),
      };
    } catch (err) {
      console.log('err', err);
      throw new BaseError('Invalid or expired refresh token.', 401);
    }
  }

  async usersListService(req, res) {
    // Save User to Database
    var lang = getLocale();

    try {
      var name = 'first_name';
      var order = 'id';
      var ordering = 'ASC';
      var queries = req.query;
      var offset = 0;
      var limit = 100;
      const query = [];
      const innerQuery = [];

      if (req.query.limit) {
        limit = req.query.limit;
      }

      if (req.query.page) {
        if (req.query.page > 1) {
          offset = req.query.page * limit - limit;
        }
      }

      if (req.query.orderby) {
        order = req.query.orderby;
      }

      if (req.query.ordering) {
        ordering = req.query.ordering;
      }

      if (req.query.keyword) {
        innerQuery.push({
          first_name: {
            [this.Op.iLike]: `%${req.query.keyword}%`,
          },
        });

        innerQuery.push({
          last_name: {
            [this.Op.iLike]: `%${req.query.keyword}%`,
          },
        });
      }

      if (req.query.keyword) {
        query.push({
          phone: {
            [this.Op.iLike]: `%${req.query.keyword}%`,
          },
        });
      }

      if (req.query.keyword) {
        query.push({
          email: {
            [this.Op.iLike]: `%${req.query.keyword}%`,
          },
        });
      }

      return await this.User.findAll({
        where: {
          [this.Op.and]: query,
        },
        include: [
          {
            model: this.Role,
            as: 'roles',
            required: false,
          },
        ],
        order: [[order, ordering]],
        offset: offset,
        limit: limit,
      });
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async usersDetailsService(criteria, transaction) {
    try {
      var lang = getLocale();
      return await this.User.findOne({
        where: {
          id: req.params.id,
        },
      });
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async userUpdate(req, res) {
    var lang = getLocale();

    try {
      // Then, we do some calls passing this transaction as an option:

      const [numberOfAffectedRows, affectedRows] = await this.User.update(
        {
          phone: req.body.phone,
          email: req.body.email,
        },
        {
          where: { id: req.params.id },
          returning: true, // needed for affectedRows to be populated
          plain: true, // makes sure that the returned instances are just plain objects
        }
      );
      var namesData = req.body.name;
      for (let index of Object.keys(namesData)) {
        var userTranslation = await this.UserTranslation.findOne({
          where: { user_id: req.params.id, lang: index },
        });
        console.log(JSON.parse(JSON.stringify(userTranslation)));
        if (userTranslation.id) {
          await this.UserTranslation.update(
            { name: namesData[index], updated_at: new Date() },
            {
              returning: true,
              plain: true,
              where: { user_id: req.params.id, lang: index },
            }
          );
        } else
          await this.UserTranslation.create({
            name: namesData[index],
            lang: index,
            user_id: req.params.id,
            status: true,
            created_at: new Date(),
            updated_at: new Date(),
          });
      }

      return true;
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async userStore(req, res) {
    try {
      // Then, we do some calls passing this transaction as an option:

      const user = await this.User.create({
        phone: req.body.phone,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8),
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      });
      var namesData = req.body.name;
      for (let index of Object.keys(namesData)) {
        await this.UserTranslation.create({
          name: namesData[index],
          lang: index,
          user_id: user.id,
          status: true,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      return true;
    } catch (ex) {
      throw new Error(ex);
    }
  }

  async invalidLoginAttempt(user, transaction) {
    try {
      let blockLoginAttempts = parseInt(this.getEnv('BLOCK_LOGIN_ATTEMPTS'));
      const loginAttempts = user?.loginAttempts
        ? parseInt(user.loginAttempts)
        : 0;
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
        throw new BaseError(
          'Your login attempts exist. Please try after 300 seconds.',
          401
        );
      } else {
        throw new BaseError('You have submitted invalid login details.', 401);
      }
    } catch (ex) {
      throw new BaseError(ex.message || __('INVALID_LOGIN_ATTEMPT'), ex.status);
    }
  }

  async blockLoginAttempts(blockExpires) {
    try {
      const currentDateTime = moment()
        .utc(this.getEnv('APP_TIMEZONE'))
        .toDate();
      if (blockExpires > currentDateTime) {
        let tryAfter =
          (new Date(blockExpires).getTime() -
            new Date(currentDateTime).getTime()) /
          1000;
        throw new BaseError(
          `Your login attempts exist. Please try after ${Math.round(
            tryAfter
          )} seconds`
        );
      }
    } catch (ex) {
      throw new BaseError(ex.message || __('INVALID_LOGIN_ATTEMPT'), ex.status);
    }
  }

  async getUserDetails(criteria, { transaction, userOnly = false }) {
    try {
      let user = await this.model.findOne({
        attributes: {
          exclude: [
            'createdAt',
            'updatedAt',
            'deletedAt',
            'isEmailVerified',
            'isPhoneVerified',
          ],
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
              where: {
                status: true,
              },
              attributes: [],
            },
            where: {
              status: true,
            },
          },
        ],
        transaction,
        lock: true,
        skipLocked: true,
        //logging: (sql) => console.log('SQL:', sql),
      });

      if (!user)
        throw new BaseError(
          'We are unable to find your account with the given details.',
          401
        );

      if (!userOnly) {
        user = user.toJSON();
        const allRoles = user.roles;

        if (allRoles.length === 0)
          throw new BaseError('User has no roles.', 400);

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
              //logging: (sql) => console.log('SQL:', sql),
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
          //logging: (sql) => console.log('SQL:', sql),
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
      const result = await this.userDevice.update(
        { status: false },
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
