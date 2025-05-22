'use strict';

import express from 'express';
import 'express-router-group';

import RolesController from '../app/controllers/roles.controller.js';
import roleValidation from '../app/validations/role.validation.js';
import AuthMiddleware from '../app/middlewares/auth.middleware.js';
import AclMiddleware from '../app/middlewares/acl.middleware.js';

import { exceptionHandler } from '../app/middlewares/exceptionHandler.middleware.js';

const router = express.Router();

router.group('/v1.0', (router) => {
  router.get(
    '/roles',
    [
      AuthMiddleware.verifyToken,
      AclMiddleware.hasPermission('listView', 'role-section'),
    ],
    exceptionHandler(RolesController.rolesList)
  );
  router.get(
    '/roles-ddl',
    [
      AuthMiddleware.verifyToken,
      AclMiddleware.hasPermission('dropDownList', 'role-section'),
    ],
    exceptionHandler(RolesController.rolesDDLList)
  );

  router.group('/role', (router) => {
    router.post(
      '',
      [
        AuthMiddleware.verifyToken,
        AclMiddleware.hasPermission('createNew', 'role-section'),
        roleValidation.create,
      ],
      exceptionHandler(RolesController.roleStore)
    );

    router.get(
      '/:id',
      [
        AuthMiddleware.verifyToken,
        AclMiddleware.hasPermission('singleDetailsView', 'role-section'),
      ],
      exceptionHandler(RolesController.roleDetails)
    );

    router.put(
      '/:id',
      [
        AuthMiddleware.verifyToken,
        AclMiddleware.hasPermission('updateExisting', 'role-section'),
        roleValidation.update,
      ],
      exceptionHandler(RolesController.roleUpdate)
    );

    router.delete(
      '/:id',
      [
        AuthMiddleware.verifyToken,
        AclMiddleware.hasPermission('deleteExisting', 'role-section'),
      ],
      exceptionHandler(RolesController.roleDelete)
    );
  });
});

export default router;
