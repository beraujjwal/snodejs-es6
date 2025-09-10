'use strict';
import jwt from 'jsonwebtoken';

import { Middleware } from './middleware.js';
import { BaseError } from '../../system/core/error/baseError.js';
import { encrypt, decrypt } from '../../helpers/encodeDecode.js';

import {
  keyExists,
  setValue,
  getValue,
  deleteValue,
} from '../../libraries/redis.library.js';

import User from '../services/user.service.js';
const userService = new User('User');

class AclMiddleware extends Middleware {
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
  hasPermission(action, module) {
    const roleResourcePermissionView = this.getModel(
      'RoleResourcePermissionView'
    );
    const userResourcePermissionView = this.getModel(
      'UserResourcePermissionView'
    );
    const JWT_SECRET = this.getEnv('JWT_SECRET');

    return async function (req, res, next) {
      try {
        const bearerHeader = req.headers['authorization'];
        if (!bearerHeader || !bearerHeader.startsWith('Bearer '))
          return next(new BaseError('Authorization token missing.', 401));
        const token = decrypt(bearerHeader.split(' ')[1]);

        const decoded = jwt.verify(token, JWT_SECRET);
        const userRedisKey = `user-${decoded.id}`;
        let userData = null;
        if (await keyExists(userRedisKey)) {
          userData = await getValue(userRedisKey);
        } else {
          throw new BaseError(`Invalid authorization token.`, 401);
        }

        let haveAccess = false;
        const userId = userData?.id;
        const roles = userData?.roles;
        const slugs = roles?.map((item) => item.slug);

        let roleResourcePermission = await roleResourcePermissionView.findOne({
          attributes: ['permissionSlug'],
          where: {
            roleSlug: slugs,
            resourceSlug: ['root', module],
            permissionSlug: ['full-access', action],
          },
        });

        let userResourcePermission = await userResourcePermissionView.findAll({
          attributes: ['permissionSlug', 'resourceSlug'],
          where: {
            userID: userId,
            resourceSlug: ['root', module],
            permissionSlug: ['full-access', 'full-deny', action],
          },
        });

        if (roleResourcePermission) haveAccess = true;

        if (userResourcePermission.length > 0) {
          const hasFullDeny = userResourcePermission.some(
            (perm) =>
              perm.permissionSlug === 'full-deny' &&
              perm.resourceSlug === module
          );

          if (hasFullDeny) haveAccess = false;
          else haveAccess = true;
        }

        if (haveAccess == false)
          return next(new BaseError('Forbidden to access this section.', 403));

        req.user = userData;
        next();
        return;
      } catch (ex) {
        ex.code = 403;
        next(ex);
      }
    };
  }
}

export default new AclMiddleware();
