'use strict';

import express from 'express';
import 'express-router-group';

import PermissionsController from '../app/controllers/permissions.controller.js';
import permissionValidation from '../app/validations/permission.validation.js';
import AuthMiddleware from '../app/middlewares/auth.middleware.js';
import AclMiddleware from '../app/middlewares/acl.middleware.js';

import { exceptionHandler } from '../app/middlewares/exceptionHandler.middleware.js';

const router = express.Router();

router.group('/v1.0', (router) => {
  router.get(
    '/permissions',
    [
      AuthMiddleware.verifyToken,
      AclMiddleware.hasPermission('read', 'permissions'),
    ],
    exceptionHandler(PermissionsController.permissionList)
  );
  router.group(
    '/permission',
    AuthMiddleware.verifyToken,
    (router) => {
      router.post(
        '',
        [
          AclMiddleware.hasPermission('create', 'permissions'),
          permissionValidation.create,
        ],
        exceptionHandler(PermissionsController.permissionStore)
      );

      router.get(
        '/:id',
        [AclMiddleware.hasPermission('read', 'permissions')],
        exceptionHandler(PermissionsController.permissionDetails)
      );

      router.put(
        '/:id',
        [
          AclMiddleware.hasPermission('update', 'permissions'),
          permissionValidation.update,
        ],
        exceptionHandler(PermissionsController.permissionUpdate)
      );

      router.patch(
        '/:id',
        [
          AclMiddleware.hasPermission('update', 'permissions')
        ],
        exceptionHandler(PermissionsController.permissionStatusUpdate)
      );

      router.delete(
        '/:id',
        [AclMiddleware.hasPermission('delete', 'permissions')],
        exceptionHandler(PermissionsController.permissionDelete)
      );
    }
  );
});

export default router;
