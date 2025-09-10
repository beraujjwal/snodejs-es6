'use strict';
import { Sequelize, Op } from 'sequelize';
import { BaseError } from '../../system/core/error/baseError.js';
import Service from './service.js';

class Team extends Service {
  /**
   * @description menu service constructor
   * @param null
   * @author Ujjwal Bera
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
  }

  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new Team(model);
    }
    return this.instances[model];
  }

  async findActiveCartonDamages({ query }, { transaction }) {
    try {
      const query = {
        limit: 100,
        page: 1,
      };
      const response = await this.findAll(query, {
        transaction,
        filter: { status: true },
      });

      return response;
    } catch (ex) {
      throw new BaseError(ex);
    }
  }

  async checkDeletable(id, { transaction }) {
    try {
      const filter = { id };
      let response = await this.model.findOne({
        where: filter,
        transaction,
      });
      if (!response) throw new BaseError('Item not found.');

      return true;

      //if(response.hasClaimSubStatus === true) throw new BaseError('Item is not active.');
    } catch (ex) {
      throw new BaseError(ex);
    }
  }
}

export default Team;
