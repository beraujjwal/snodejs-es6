'use strict';
import jwt from 'jsonwebtoken';

import { Middleware } from './middleware.js';
import { BaseError } from '../../system/core/error/baseError.js';
import { encrypt, decrypt } from '../../helpers/encodeDecode.js';

class AuthMiddleware extends Middleware {
  /**
   * Controller constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
    this.User = this.getModel('User');
    this.Role = this.getModel('Role');
    this.UserDevice = this.getModel('UserDevice');
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  async verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    const userRole = req?.params?.role;
    const { 'x-device-id': deviceId } = req.headers;

    try {
      if (!bearerHeader)
        throw new BaseError(`Authorization token not found.`, 401);

      const token = decrypt(bearerHeader.split(' ')[1]);
      if (!token)
        throw new BaseError(`Unauthorized to access this section.`, 401);

      //const decoded = jwt.verify(token, this.getEnv('JWT_SECRET'));

      let decoded;
      try {
        decoded = jwt.verify(token, this.getEnv('JWT_SECRET'));
      } catch (err) {
        throw new BaseError(`Invalid authorization token.`, 401);
      }

      if (!decoded) throw new BaseError(`Invalid authorization token.`, 401);

      const user = await this.User.findByPk(decoded.id, {
        attributes: [
          'id',
          'first_name',
          'last_name',
          'email',
          'phone',
          'status',
          'verified',
        ],
        include: [
          {
            model: this.Role,
            as: 'roles',
            attributes: {
              exclude: ['description', 'createdAt', 'updatedAt', 'deletedAt'],
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
          {
            model: this.UserDevice,
            as: 'userDevices',
            where: {
              deviceId: deviceId,
              deviceSalt: decoded.tokenSalt,
              status: true,
            },
            attributes: [
              'id',
              //'deviceToken',
              'os',
              'deviceSalt',
              'deviceId',
              'deviceType',
              'browser',
              'ip',
              'os',
              'deviceId',
            ],
            limit: 1, // Get only the latest post
            order: [['createdAt', 'DESC']], // Sort by latest createdAt
          },
        ],
        logging: console.log,
      });
      const userData = user ? user.toJSON() : null;

      if (userData === null || userData.isCompleted === false)
        throw new BaseError(`Invalid authorization token.`, 401);

      if (userData?.userDevices.length === 0)
        throw new BaseError(`Invalid authorization token.`, 401);

      const authorities = [];
      const roles = userData.roles;
      for await (const role of roles) {
        authorities.push(role?.slug);
      }

      if (userRole) {
        if (!authorities.includes(userRole)) {
          throw new BaseError(`Invalid authorization token.`, 401);
        }
      }

      req.user = userData;
      next();

      return;
    } catch (ex) {
      ex.code = 401;
      next(ex);
    }
  }

  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} next
   * @returns
   */
  async verifyiNCompletedToken(req, res, next) {
    let bearerHeader = req.headers['authorization'];

    let userRole = req.params.role;
    req.role = userRole;
    if (!bearerHeader) {
      next('Authorization token not found!');
    }

    const token = bearerHeader.split(' ')[1];
    if (!token) {
      next('Authorization token not found!!');
    }

    try {
      let decoded = jwt.verify(token, this.getEnv('JWT_SECRET'));
      if (!decoded) {
        next('Invalid authorization token.');
      }

      req.user_id = decoded.id;

      let salt = decoded.tokenSalt ? decoded.tokenSalt : 1;
      //Finding user with set criteria
      let user = await this.User.findOne({
        _id: decoded.id,
        tokenSalt: salt,
        deleted: false,
      })
        .populate('roles', '-__v')
        .exec();

      if (user === null) {
        next('Invalid authorization token.');
      }

      const authorities = [];
      for await (const role of user.roles) {
        authorities.push(role?.slug);
      }

      if (userRole) {
        if (!authorities.includes(userRole)) {
          next('Invalid authorization token.');
        }
      }

      req.user = JSON.parse(JSON.stringify(user));
      next();

      return;
    } catch (ex) {
      next(ex.message);
    }
  }
}

export default new AuthMiddleware();
