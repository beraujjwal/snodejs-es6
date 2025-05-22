'use strict';

import express from 'express';
import 'express-router-group';

import resourcesController from '../app/controllers/resources.controller.js';
import resourceValidation from '../app/validations/resource.validation.js';
import AuthMiddleware from '../app/middlewares/auth.middleware.js';
import AclMiddleware from '../app/middlewares/acl.middleware.js';

import { exceptionHandler } from '../app/middlewares/exceptionHandler.middleware.js';

const router = express.Router();

router.group('/v1.0', (router) => {
  router.get('/resources', exceptionHandler(resourcesController.resourcesList));

  router.group('/resource', AuthMiddleware.verifyToken, (router) => {
    router.post(
      '',
      [
        AclMiddleware.hasPermission('create', 'resources'),
        resourceValidation.create,
      ],
      exceptionHandler(resourcesController.resourceStore)
    );

    router.get(
      '/:id',
      [AclMiddleware.hasPermission('read', 'resources')],
      exceptionHandler(resourcesController.resourceDetails)
    );

    router.put(
      '/:id',
      [
        AclMiddleware.hasPermission('update', 'resources'),
        resourceValidation.update,
      ],
      exceptionHandler(resourcesController.resourceUpdate)
    );

    router.patch(
      '/:id',
      [AclMiddleware.hasPermission('update', 'resources')],
      exceptionHandler(resourcesController.resourceStatusUpdate)
    );

    router.delete(
      '/:id',
      [
        AuthMiddleware.verifyToken,
        AclMiddleware.hasPermission('delete', 'resources'),
      ],
      exceptionHandler(resourcesController.resourceDelete)
    );
  });

  router.delete(
    '/resource-permission/:resourceId/:permissionId',
    [
      AuthMiddleware.verifyToken,
      AclMiddleware.hasPermission('update', 'resources'),
    ],
    exceptionHandler(resourcesController.deleteResourcePermission)
  );
});

export default router;
