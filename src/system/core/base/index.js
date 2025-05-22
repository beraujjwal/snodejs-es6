'use strict';
import 'dotenv/config';
import autoBind from 'auto-bind';
import db from '../model/index.js';

class Base {
  /**
   * @author Ujjwal Bera
   */
  constructor() {
    autoBind(this);
  }

  getEnv(element) {
    return process.env[element];
  }

  getModel(model) {
    return db[model];
  }
}

export default Base;
