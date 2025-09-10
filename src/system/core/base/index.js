'use strict';
import 'dotenv/config';
import { noCase, snakeCase } from 'change-case';
import pluralize from 'pluralize';

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

  static toLabelPluralize(name) {
    const spaced = noCase(name);
    const plural = pluralize(spaced);
    return plural.charAt(0).toUpperCase() + plural.slice(1);
  }

  static toLabelSingular(name) {
    const spaced = noCase(name);
    const singular = pluralize.singular(spaced);
    return singular.charAt(0).toUpperCase() + singular.slice(1);
  }

  static toStringPluralize(name) {
    return pluralize(noCase(name));
  }

  static toStringSingular(name) {
    return pluralize.singular(noCase(name));
  }

  /**
   * Converts a name to camelCase and then pluralizes it.
   * 
   * @param {string} name - The name to convert.
   * @returns {string} The camelCase pluralized name.
   */
  static toCamelCasePluralize(name) {
    const singular = pluralize.singular(name);
    const camel = camelCase(singular);
    return pluralize.plural(camel);
  }

  /**
   * Converts a model name to plural snake case.
   * @param {string} name - The model name.
   * @returns {string} The plural snake case model name.
   * @example
   * Base.toSnakeCasePluralize('User') // users
   */
  static toSnakeCasePluralize(name) {
    const singular = pluralize.singular(name);
    const snakeCaseText = snakeCase(singular);
    return pluralize.plural(snakeCaseText);
  }
}

export default Base;
