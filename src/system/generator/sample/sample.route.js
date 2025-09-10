'use strict';

import express from 'express';
import 'express-router-group';

import CONTROLLER_CAMEL_CASE_PLURAL_FORMController from '../app/controllers/CONTROLLER_CAMEL_CASE_PLURAL_FORM.controller.js';
import VALIDATION_CAMEL_CASE_SINGULAR_FROMValidation from '../app/validations/VALIDATION_CAMEL_CASE_SINGULAR_FROM.validation.js';
import AuthMiddleware from '../app/middlewares/auth.middleware.js';
import AclMiddleware from '../app/middlewares/acl.middleware.js';

import { exceptionHandler } from '../app/middlewares/exceptionHandler.middleware.js';

const router = express.Router();
router.group('/v1.0', (router) => {
  router.get(
    '/PLURAL_SAMLL_CASE',
    [
      AuthMiddleware.verifyToken,
      AclMiddleware.hasPermission('listView', 'PLURAL_SAMLL_CASE'),
    ],
    exceptionHandler(CONTROLLER_CAMEL_CASE_PLURAL_FORMController.findAll)
  );
  router.group('/SINGULAR_SAMLL_CASE', AuthMiddleware.verifyToken, (router) => {
    router.post(
      '',
      [
        AclMiddleware.hasPermission('createNew', 'PLURAL_SAMLL_CASE'),
        VALIDATION_CAMEL_CASE_SINGULAR_FROMValidation.create,
      ],
      exceptionHandler(CONTROLLER_CAMEL_CASE_PLURAL_FORMController.createOne)
    );

    router.get(
      '/:id',
      [AclMiddleware.hasPermission('singleDetailsView', 'PLURAL_SAMLL_CASE')],
      exceptionHandler(CONTROLLER_CAMEL_CASE_PLURAL_FORMController.findByPk)
    );

    router.put(
      '/:id',
      [
        AclMiddleware.hasPermission('updateExisting', 'PLURAL_SAMLL_CASE'),
        VALIDATION_CAMEL_CASE_SINGULAR_FROMValidation.update,
      ],
      exceptionHandler(CONTROLLER_CAMEL_CASE_PLURAL_FORMController.updateByPk)
    );

    router.patch(
      '/:id',
      [AclMiddleware.hasPermission('updateExisting', 'PLURAL_SAMLL_CASE')],
      exceptionHandler(
        exceptionHandler(
          CONTROLLER_CAMEL_CASE_PLURAL_FORMController.switchStatusByPk
        )
      )
    );

    router.delete(
      '/:id',
      [AclMiddleware.hasPermission('deleteExisting', 'PLURAL_SAMLL_CASE')],
      exceptionHandler(CONTROLLER_CAMEL_CASE_PLURAL_FORMController.deleteById)
    );
  });
});
module.exports = router;
