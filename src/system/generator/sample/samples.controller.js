'use strict';
//import autoBind from '../../system/autobind.js';
import { controller } from './controller.js';
import { BaseError } from '../../system/core/error/baseError.js';
import { CONTROLLER_CAMEL_CASE_SINGULAR } from '../services/CONTROLLER_CAMEL_CASE_SINGULAR.service';
const CONTROLLER_CAMEL_CASE_SINGULARService =
  new CONTROLLER_CAMEL_CASE_SINGULAR('MODEL_SINGULAR_FORM');

class CONTROLLER_CAMEL_CASE_PLURAL_FORMController extends controller {
  /**
   * Controller constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor(service) {
    super(service);
    //autoBind(this);
  }

  /**
   * @description Fetch list of CONTROLLER_CAMEL_CASE_SINGULARs
   * @author Ujjwal Bera<ujjwalbera.dev@gmail.com>
   * @param req : request
   * @param transaction : transaction
   * @returns {*}
   */
  async getAll(req, transaction) {
    const result = await CONTROLLER_CAMEL_CASE_SINGULARService.getAll(
      req.query,
      { transaction }
    );
    if (result === undefined || result === null)
      throw new BaseError(
        __('SINGULAR_PROCESS_NAME_UPPERCASES_LIST_FETCH_ERROR')
      );
    return {
      code: 200,
      result,
      message: 'SINGULAR_PROCESS_NAME_UPPERCASES_LIST_FETCH_SUCESSFULLY',
    };
  }

  /**
   * @description Create a new CONTROLLER_CAMEL_CASE_SINGULAR
   * @author Ujjwal Bera<ujjwalbera.dev@gmail.com>
   * @param req : request
   * @param transaction : transaction
   * @returns {*}
   */
  async create(req, transaction) {
    const { name } = req.body;
    const result = await CONTROLLER_CAMEL_CASE_SINGULARService.create(
      { name },
      { transaction }
    );
    if (result === undefined || result === null)
      throw new BaseError(__('UNABLE_TO_ADD_SINGULAR_PROCESS_NAME_UPPERCASE'));
    return {
      code: 201,
      result,
      message: 'SINGULAR_PROCESS_NAME_UPPERCASE_ADDED_SUCESSFULLY',
    };
  }

  /**
   * @description Fetch CONTROLLER_CAMEL_CASE_SINGULAR details by primary key
   * @author Ujjwal Bera<ujjwalbera.dev@gmail.com>
   * @param req : request
   * @param transaction : transaction
   * @returns {*}
   */
  async findByPk(req, transaction) {
    const id = req.params.id;
    const result = await CONTROLLER_CAMEL_CASE_SINGULARService.findByPk(id, {
      transaction,
    });
    if (result === undefined || result === null)
      throw new BaseError(
        __('UNABLE_TO_FETCH_SINGULAR_PROCESS_NAME_UPPERCASE')
      );
    return {
      code: 200,
      result,
      message: 'SINGULAR_PROCESS_NAME_UPPERCASE_DEATILS_FETCHED_SUCESSFULLY',
    };
  }

  /**
   * @description Update CONTROLLER_CAMEL_CASE_SINGULAR details by primary key
   * @author Ujjwal Bera<ujjwalbera.dev@gmail.com>
   * @param req : request
   * @param transaction : transaction
   * @returns {*}
   */
  async updateByPk(req, transaction) {
    const id = req.params.id;
    const { name, status } = req.body;
    const result = await CONTROLLER_CAMEL_CASE_SINGULARService.updateByPk(
      id,
      { name, status },
      { transaction }
    );
    if (result === undefined || result === null)
      throw new BaseError(
        __('UNABLE_TO_UPDATE_SINGULAR_PROCESS_NAME_UPPERCASE')
      );
    return {
      code: 200,
      result,
      message: 'SINGULAR_PROCESS_NAME_UPPERCASE_UPDATED_SUCESSFULLY',
    };
  }

  /**
   * @description Delete CONTROLLER_CAMEL_CASE_SINGULAR by primary key
   * @author Ujjwal Bera<ujjwalbera.dev@gmail.com>
   * @param req : request
   * @param transaction : transaction
   * @returns {*}
   */
  async deleteByPk(req, res, next) {
    const id = req.params.id;
    const result = await CONTROLLER_CAMEL_CASE_SINGULARService.deleteByPk(
      id,
      { ...req.body },
      { transaction }
    );
    if (result === undefined || result === null)
      throw new BaseError(
        __('UNABLE_TO_UPDATE_SINGULAR_PROCESS_NAME_UPPERCASE')
      );
    return {
      code: 200,
      result,
      message: 'SINGULAR_PROCESS_NAME_UPPERCASE_UPDATED_SUCESSFULLY',
    };
  }
}

export default new CONTROLLER_CAMEL_CASE_PLURAL_FORMController(
  CONTROLLER_CAMEL_CASE_SINGULARService
);
