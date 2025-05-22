'use strict';

import { Validation } from './validation.js';

class UserValidation extends Validation {
  /**
   * Validation constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor() {
    super();
    this.regexEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  }

  async tenantSignup(req, res, next) {
    const validationRule = {
      name: 'required|string',
      email: 'required|email',
      phone: 'required|numeric',
      organization: 'required|string',
      domain: 'required|string',
      password: 'required|string|strict|min:6',
    };
    return await this.validate(req, res, next, validationRule);
  }

  async verify(req, res, next) {
    let rule = req.body.username.match(this.regexEmail)
      ? 'required|email'
      : 'required|numeric';
    const validationRule = {
      username: rule,
    };
    return await this.validate(req, res, next, validationRule);
  }

  async signin(req, res, next) {
    const validationRule = {
      username: 'required',
      password: 'required',
    };
    return await this.validate(req, res, next, validationRule);
  }

  async profile(req, res, next) {
    const userId = req.user.id;
    const validationRule = {
      name: 'required|string',
      email: 'required|email|unique:User,email,_id,' + userId,
      phone: 'required|string|unique:User,phone,_id,' + userId,
    };
    return await this.validate(req, res, next, validationRule);
  }

  async forgotPassword(req, res, next) {
    const validationRule = {
      username: 'required',
    };
    return await this.validate(req, res, next, validationRule);
  }

  async changePassword(req, res, next) {
    const validationRule = {
      old_password: 'required',
      password: 'required',
      password_confirmation: 'required',
    };
    return await this.validate(req, res, next, validationRule);
  }


  async generateToken(req, res, next) {
    const validationRule = {
      token: 'required|string',
    };
    return await this.validate(req, res, next, validationRule);
  }
}
export default new UserValidation();
