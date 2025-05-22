'use strict';
import jwt from 'jsonwebtoken';

import { Middleware } from './middleware.js';
import { BaseError } from '../../system/core/error/baseError.js';
import { encrypt, decrypt } from '../../helpers/encodeDecode.js';

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
    this.user = this.getModel('User');
    //autoBind(this);
  }

  /**
   *
   * @param {*} action
   * @param {*} module
   * @returns
   */
  hasPermission(action, module) {
    const userModel = this.user;
    const env = this.env;
    const getEnv = this.getEnv;
    const roleResourcePermissionView = this.getModel(
      'RoleResourcePermissionView'
    );
    const userResourcePermissionView = this.getModel(
      'UserResourcePermissionView'
    );

    return async function (req, res, next) {
      try {
        const decoded = req.user;
        let haveAccess = false;
        const userId = decoded.id;
        const roles = decoded.roles;
        const slugs = roles.map((item) => item.slug);

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

        if (haveAccess == false) {
          const err = new Error('Forbidden to access this section.');
          err.statusCode = 403;
          next(err);
        }

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
