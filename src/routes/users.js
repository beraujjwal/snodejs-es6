'use strict';

import express from 'express';
import 'express-router-group';

import UsersController from '../app/controllers/users.controller.js';
import AuthController from '../app/controllers/auth.controller.js';
import UserValidation from '../app/validations/user.validation.js';
import AuthMiddleware from '../app/middlewares/auth.middleware.js';
import AclMiddleware from '../app/middlewares/acl.middleware.js';

import { exceptionHandler } from '../app/middlewares/exceptionHandler.middleware.js';

const router = express.Router();

router.group('/v1.0', (versionRouter) => {
  versionRouter.group('/auth', (authRouter) => {
    authRouter.post(
      '/tenant-sign-up',
      [UserValidation.tenantSignup],
      exceptionHandler(AuthController.tenantSignup)
    );
    authRouter.post(
      '/tenant-registration-verification/:identifier/:verificationToken',
      exceptionHandler(AuthController.verificationTenantAccount)
    );
    authRouter.post(
      '/sign-in',
      [UserValidation.signin],
      exceptionHandler(AuthController.login)
    );

    authRouter.post(
      '/generate-token',
      [UserValidation.generateToken],
      exceptionHandler(AuthController.generateToken)
    );

    authRouter.post(
      '/account-verifying-otp-resend',
      [UserValidation.signin],
      exceptionHandler(AuthController.accountVerifyingOTPResend)
    );
    authRouter.post(
      '/otp-verify',
      [UserValidation.signin],
      exceptionHandler(AuthController.otpVerify)
    );
    authRouter.post(
      '/email-verify',
      exceptionHandler(AuthController.emailVerify)
    );
    authRouter.post(
      '/phone-verify',
      exceptionHandler(AuthController.phoneVerify)
    );

    authRouter.post(
      '/forgot-password',
      [UserValidation.forgotPassword],
      exceptionHandler(AuthController.forgotPassword)
    );

    authRouter.post(
      '/reset-password',
      [UserValidation.forgotPassword],
      exceptionHandler(AuthController.resetPassword)
    );
  });

  versionRouter.get(
    '/profile',
    AuthMiddleware.verifyiNCompletedToken,
    exceptionHandler(UsersController.profile)
  );

  versionRouter.put(
    '/profile',
    [AuthMiddleware.verifyiNCompletedToken, UserValidation.profile],
    exceptionHandler(UsersController.updateProfile)
  );

  versionRouter.post(
    '/change-password',
    [AuthMiddleware.verifyiNCompletedToken, UserValidation.changePassword],
    exceptionHandler(UsersController.changePassword)
  );

  versionRouter.group('/user', (secureRouter) => {
    secureRouter.post(
      '/logout',
      [AuthMiddleware.verifyToken],
      exceptionHandler(AuthController.logout)
    );

    secureRouter.get(
      '/whoiam',
      [AuthMiddleware.verifyToken],
      exceptionHandler(UsersController.whoiam)
    );
  });

  // versionRouter.get(
  //   '/:role/user/:id',
  //   [AuthMiddleware.verifyToken, AclMiddleware.hasPermission('read', 'users')],
  //   exceptionHandler(UsersController.userDetails)
  // );

  // versionRouter.put(
  //   '/:role/user/:id',
  //   [AuthMiddleware.verifyToken, AclMiddleware.hasPermission('update', 'users')],
  //   exceptionHandler(UsersController.userUpdate)
  // );

  // versionRouter.delete(
  //   '/:role/user/:id',
  //   [AuthMiddleware.verifyToken, AclMiddleware.hasPermission('delete', 'users')],
  //   exceptionHandler(UsersController.userDelete)
  // );

  // versionRouter.get(
  //   '/:role/users',
  //   [AuthMiddleware.verifyToken, AclMiddleware.hasPermission('read', 'users')],
  //   exceptionHandler(UsersController.userList)
  // );
});

export default router;
