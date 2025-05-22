'use strict';
//import autoBind from '../../system/autobind.js';
import { BaseError } from '../../system/core/error/baseError.js';
import Controller from './controller.js';

import User from '../services/user.service.js';
const userService = User.getInstance('User');

class UsersController extends Controller {
  /**
   * Controller constructor
   * @author Ujjwal Bera
   * @param  {service} service - Service layer object
   */
  constructor(service) {
    super(service);
    this.service = service;
  }

  async whoiam({ user }, { transaction }) {
    const criteria = {
      id: user.id,
      status: true,
    };
    const result = await this.service.getUserDetails(criteria, {
      transaction,
      userOnly: false,
    });

    if (result) {
      return {
        code: 200,
        result,
        message: 'Profile details got successfully!',
      };
    }
    throw new BaseError(
      'Some error occurred while fetching profile details.',
      500
    );
  }

  /**
   * @desc get logged-in user profile
   * @param {*} req
   */
  async profile({ user }, { transaction }) {
    //console.log(req.user);
    const phone = user?.phone;
    let result = await userService.getProfile(phone);
    if (result) {
      return {
        code: 200,
        result,
        message: 'Profile details got successfully!',
      };
    }
    throw new BaseError(
      'Some error occurred while fetching profile details.',
      500
    );
  }

  /**
   * @desc update logged-in user profile
   * @param {*} req
   * @param {*} transaction
   */
  async updateProfile({ body, user }, { transaction }) {
    let result = await userService.updateProfile(user.id, body, {
      transaction,
    });
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'Profile details updated successfully!'));
    }

    throw new BaseError(
      'Some error occurred while updating profile details.',
      500
    );
  }

  /**
   * @desc change password of logged-in user
   * @param {*} req
   * @param {*} transaction
   */
  async changePassword({ body, user }, { transaction }) {
    let result = await userService.changePassword(user.id, body, {
      transaction,
    });
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'Profile password updated successfully!'));
    }

    throw new BaseError(
      'Some error occurred while updating profile password.',
      500
    );
  }

  /**
   * @desc Fetching list of users
   * @param {*} req
   */
  async userList({ query }, { transaction }) {
    let result = await userService.userList(query);
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'User list got successfully!'));
    }

    throw new BaseError(
      'Some error occurred while fetching list of users.',
      500
    );
  }

  /**
   * @desc Store a new user
   * @param {*} req
   * @param {*} transaction
   */
  async userStore({ body }, { transaction }) {
    let { name, email, phone, password, roles, verified, status } = body;
    let result = await userService.userStore(
      { name, email, phone, password, roles, verified, status },
      { transaction }
    );
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'New user created successfully!'));
    }

    throw new BaseError('Some error occurred while creating new user.', 500);
  }

  /**
   * @desc Fetch detail of a user
   * @param {*} req
   */
  async userDetails({ params }, { transaction }) {
    let userId = params.id;
    let result = await userService.userDetails(userId);
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'User details fetched successfully!'));
    }

    throw new BaseError(
      'Some error occurred while fetching user details.',
      500
    );
  }

  /**
   * @desc Updated a user
   * @param {*} req
   * @param {*} transaction
   */
  async userUpdate({ body, params }, { transaction }) {
    let userId = params.id;
    let { name, email, phone, roles, status } = body;
    let result = await userService.userUpdate(
      {
        userId,
        name,
        email,
        phone,
        roles,
        status,
      },
      { transaction }
    );
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'User details updated successfully!'));
    }

    throw new BaseError(
      'Some error occurred while updating user details.',
      500
    );
  }

  /**
   * @desc Delete a user
   * @param {*} req
   * @param {*} transaction
   */
  async userDelete({ params }, { transaction }) {
    let userId = params.id;
    let result = await userService.userDelete(userId, { transaction });
    if (result) {
      return res
        .status(200)
        .json(this.success(result, 'User deleted successfully!'));
    }

    throw new BaseError('Some error occurred while deleting user.', 500);
  }
}
export default new UsersController(userService);
