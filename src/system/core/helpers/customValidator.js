'use strict';

import Validator from 'validatorjs';
import { Op } from 'sequelize';
import db from '../model/index.js';

class CustomValidator {
  constructor() {
    this.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]/;
    this.registerValidators();
  }

  registerValidators() {
    this.registerUniqueValidator();
    this.registerExistsValidator();
    this.registerLengthValidator();
    this.registerStrictValidator();
    this.registerTelephoneValidator();
    this.registerDomainValidator();
  }

  registerUniqueValidator() {
    Validator.registerAsync('unique', async (value, attribute, req, passes) => {
      if (!attribute) {
        passes(false, 'Specify Requirements i.e fieldName: unique:table,column');
        return;
      }

      let attArr = attribute.split(',');
      if (attArr.length < 1) {
        passes(false, `Invalid format for validation rule on ${attribute}`);
        return;
      }

      const { 0: table, 1: column, 2: pk, 3: pkvalue } = attArr;
      let msg = column === 'username' ? `This ${column} has already been taken.` : `This ${column} is already associated with an account.`;
      
      let criteria = { [column]: value };
      if (pk && pkvalue) {
        criteria = { ...criteria, [pk]: { [Op.ne]: pkvalue } };
      }
      
      let user = await db[table].findOne({ where: criteria });
      if (user) {
        passes(false, msg);
        return;
      }

      passes();
    });
  }

  registerExistsValidator() {
    Validator.registerAsync('exists', async (value, attribute, param, passes) => {
      if (!attribute) {
        passes(false, 'Specify Requirements i.e fieldName: exists:table,column');
        return;
      }

      let attArr = attribute.split(',');
      if (attArr.length < 1) {
        passes(false, `Invalid format for validation rule on ${attribute}`);
        return;
      }

      const { 0: table, 1: column } = attArr;
      let msg = `The ${param} whose value (${value}) was not found.`;
      let criteria = { status: true, [column]: value };
      const datas = await db[table].findAll({ where: criteria, attributes: ['id'] });

      if (!datas) {
        passes(false, msg);
        return;
      } else if (Array.isArray(value) && datas.length !== value.length) {
        msg = `The ${param} whose value (${value.toString()}) was not found.`;
        passes(false, msg);
        return;
      }

      passes();
    });
  }

  registerLengthValidator() {
    Validator.register('length', (value, attribute) => {
      if (!attribute) throw new Error('Specify Requirements i.e length:10');
      if (isNaN(parseInt(attribute))) throw new Error(`Invalid format of validation rule on length:${attribute}`);
      return parseInt(value.length) === parseInt(attribute);
    }, 'The :attribute value length is not matching.');
  }

  registerStrictValidator() {
    Validator.register('strict', (value) => this.passwordRegex.test(value), 'The :attribute must contain at least one uppercase letter, one lowercase letter and one number');
  }

  registerTelephoneValidator() {
    Validator.register('telephone', (value) => value.match(/^\+?[1-9]\d{1,14}$/), 'The :attribute is not a valid phone number.');
  }

  registerDomainValidator() {
    Validator.register('domain', (value) => value.match(/^(((http|https):\/\/|)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,6}(:[0-9]{1,5})?(\/.*)?)$/), 'The :attribute is not a valid domain.');
  }

  async validate(body, rules, customMessages, callback) {
    const validation = new Validator(body, rules, customMessages);
    validation.passes(() => callback(null, true));
    validation.fails(() => callback(validation.errors, false));
  }
}

export default new CustomValidator();