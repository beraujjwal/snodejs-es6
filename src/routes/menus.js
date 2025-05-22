'use strict';

import express from 'express';
import 'express-router-group';

import MenusController from '../app/controllers/menus.controller.js';
import menuValidation from '../app/validations/menu.validation.js';
import AuthMiddleware from '../app/middlewares/auth.middleware.js';
import AclMiddleware from '../app/middlewares/acl.middleware.js';

import { exceptionHandler } from '../app/middlewares/exceptionHandler.middleware.js';

const router = express.Router();

router.group('/v1.0', (router) => {
  router.get(
    '/menus',
    [
      AuthMiddleware.verifyToken,
      AclMiddleware.hasPermission('read', 'menus'),
    ],
    exceptionHandler(MenusController.menusList)
  );
  router.group(
    '/menu',
    AuthMiddleware.verifyToken,
    (router) => {
      router.post(
        '',
        [
          AclMiddleware.hasPermission('create', 'menus'),
          menuValidation.create,
        ],
        exceptionHandler(MenusController.menuStore)
      );

      router.get(
        '/:id',
        [AclMiddleware.hasPermission('read', 'menus')],
        exceptionHandler(MenusController.menuDetails)
      );

      router.put(
        '/:id',
        [
          AclMiddleware.hasPermission('update', 'menus'),
          menuValidation.update,
        ],
        exceptionHandler(MenusController.menuUpdate)
      );

      router.patch(
        '/:id',
        [
          AclMiddleware.hasPermission('update', 'menus')
        ],
        exceptionHandler(MenusController.menuStatusUpdate)
      );

      router.delete(
        '/:id',
        [AclMiddleware.hasPermission('delete', 'menus')],
        exceptionHandler(MenusController.menuDelete)
      );
    }
  );
});

export default router;
