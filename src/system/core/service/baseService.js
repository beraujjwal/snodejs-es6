'use strict';
import { Sequelize, Op } from 'sequelize';
import Base from '../base/index.js';
import { BaseError } from '../error/baseError.js';
import { error } from '../helpers/console.js';

class BaseService extends Base {
  static instances = {};

  /**
   * BaseService constructor
   *
   * @author Ujjwal Bera   *
   * @param {string} model - Name of the model for service
   */
  constructor(model) {
    super();
    this.model = this.getModel(model);
    this.name = model;
    this.instances = {};
  }

  /**
   * Gets an instance of BaseService for the given model.
   *
   * @author Ujjwal Bera
   * @static
   * @param {string} model - Name of the model for service
   * @returns {BaseService} instance of BaseService
   */
  static getInstance(model) {
    if (!this.instances[model]) {
      this.instances[model] = new BaseService(model);
    }
    return this.instances[model];
  }

  /**
   * Finds all records of a model.
   *
   * @author Ujjwal Bera
   * @param {Object} query - Query parameters
   * @param {Object} options - Options
   * @param {Object} [options.filter=null] - Filter for the records
   * @param {string[]} [options.include=[]] - Include associations
   * @param {string[]} [options.attributes=null] - List of attributes to return
   * @param {Sequelize.Transaction} [options.transaction=null] - Transaction
   * @returns {Promise<Object>}
   */
  async findAll(
    {
      order_by = 'order',
      ordering = 'ASC',
      limit = this.getEnv('DATA_PER_PAGE') || 10,
      page = 1,
      order_by_can_have_null = false,
      ...query
    },
    { filter = null, include = [], attributes, transaction } = {}
  ) {
    try {
      let pagination = {};
      attributes = attributes || BaseService.getModelAttributes(this.model);
      if (!attributes.includes('order')) order_by = 'id';
      limit = parseInt(limit, 10);
      page = Math.max(1, parseInt(page, 10));
      const offset = (page - 1) * limit;
      const order = ordering.toUpperCase();
      const orderingCondition = order_by_can_have_null
        ? [
            [Sequelize.col(order_by), `${order} NULLS FIRST`],
            ['id', order],
          ]
        : [
            [order_by, order],
            ['id', order],
          ];

      filter = filter || BaseService.generateQueryFilterFromQueryParams(query);
      const mergedIncludes = BaseService.mergeIncludes(
        include,
        await this.getAutoIncludes(this.model)
      );

      if (limit !== 0) pagination = { limit, offset };

      const [rows, total] = await Promise.all([
        this.model.findAll({
          attributes,
          where: filter,
          include: mergedIncludes,
          order: orderingCondition,
          ...pagination,
          lock: {
            level: transaction.LOCK.UPDATE,
            of: this.model,
            skipLocked: true,
          },
          transaction,
        }),
        this.model.count({
          where: filter,
          transaction,
        }),
      ]);
      //const rowsData = rows.map((item) => item.toJSON());

      return {
        count: rows.length,
        limit,
        page,
        range: [offset + 1, offset + rows.length],
        rows,
        total,
      };
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || `Error fetching ${this.name}s list.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  /**
   * Retrieves a single record based on the provided query parameters.
   * Utilizes the model's findOne method to fetch data, including specified attributes and associations.
   * Throws a BaseError if the item is not found or if an error occurs during the fetch process.
   *
   * @author Ujjwal Bera
   * @param {Object} query - The query parameters for fetching a single record.
   * @param {Object} options - Additional options for the query.
   * @param {Object} [options.filter=null] - Filter criteria for the record search.
   * @param {Array} [options.include=[]] - List of associations to include with the record.
   * @param {Array} [options.attributes] - Specific attributes to retrieve for the record.
   * @param {Sequelize.Transaction} [options.transaction] - Transaction context for the operation.
   * @param {Array} [options.order=['createdAt', 'DESC']] - Specifies the order of records.
   * @returns {Promise<Object>} - A promise that resolves to the fetched record.
   * @throws {BaseError} - If the item is not found or an error occurs during fetching.
   */
  async findOne(
    query,
    {
      filter = null,
      include = [],
      attributes,
      transaction,
      order = ['createdAt', 'DESC'],
    } = {}
  ) {
    try {
      attributes = attributes || BaseService.getModelAttributes(this.model);
      filter = filter || BaseService.generateQueryFilterFromQueryParams(query);
      const mergedIncludes = BaseService.mergeIncludes(
        include,
        await this.getAutoIncludes(this.model)
      );

      const item = await this.model.findOne({
        attributes,
        where: filter,
        include: mergedIncludes,
        order: [order],
        lock: {
          level: transaction.LOCK.UPDATE,
          skipLocked: true,
        },
        transaction,
      });
      if (!item) throw new BaseError(`${this.name} not found.`, 404);
      return item;
      //const itemData = item?.toJSON();
      //return itemData;
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || `Error fetching ${this.name} details.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  /**
   * Retrieves a single record based on the primary key.
   * Utilizes the model's findOne method to fetch data, including specified attributes and associations.
   * Throws a BaseError if the item is not found or if an error occurs during the fetch process.
   *
   * @author Ujjwal Bera
   * @param {number} id - The primary key of the record to fetch.
   * @param {Object} options - Additional options for the query.
   * @param {Sequelize.Transaction} [options.transaction] - Transaction context for the operation.
   * @param {Array} [options.include] - List of associations to include with the record.
   * @param {Array} [options.attributes] - Specific attributes to retrieve for the record.
   * @returns {Promise<Object>} - A promise that resolves to the fetched record.
   * @throws {BaseError} - If the item is not found or an error occurs during fetching.
   */

  async findByPk(id, { transaction, include, attributes }) {
    try {
      const filter = { id };
      return this.findOne(null, { filter, include, attributes, transaction });
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || `Error fetching ${this.name} details.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  /**
   * Creates a new record for the given data, including specified attributes and associations.
   * Utilizes the model's create method to save the data, including individual hooks.
   * Throws a BaseError if the item is not created or if an error occurs during the operation.
   *
   * @author Ujjwal Bera
   * @param {Object} data - The data to save for the new record.
   * @param {Object} [options] - Additional options for the query.
   * @param {Sequelize.Transaction} [options.transaction] - Transaction context for the operation.
   * @param {Object} [options.user] - User object with the ID of the user making the request.
   * @returns {Promise<Object>} - A promise that resolves to the newly created record.
   * @throws {BaseError} - If the item is not created or an error occurs during the operation.
   */
  async createOne(data, { transaction, user } = {}) {
    try {
      const modelAttributes = BaseService.getModelAttributes(this.model);
      const finalData = Object.fromEntries(
        Object.entries(data).filter(([key]) => modelAttributes.includes(key))
      );

      const relationData = Object.fromEntries(
        Object.entries(data).filter(([key]) => !modelAttributes.includes(key))
      );
      const item = await this.model.create(finalData, {
        transaction,
        userID: parseInt(user.id),
      });

      const associations = await this.getModelAssociations(this.model);
      for (const association of associations) {
        if (association.type === 'BelongsToMany') {
          const associationAsKey = Base.toSnakeCasePluralize(association.as);
          if (
            relationData.hasOwnProperty(associationAsKey) &&
            // Array.isArray(relationData.associationAsKey) &&
            relationData[associationAsKey].length > 0
          ) {
            item[association.accessors.set] = await item[
              association.accessors.set
            ](relationData[associationAsKey], {
              transaction,
              individualHooks: true,
              userID: parseInt(user.id),
            });
          }
        }
      }
      if (!item) throw new BaseError(`Error adding new ${this.name}.`, 400);
      // const itemData = item?.toJSON();
      // return itemData;
      return item;
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || `Error adding new ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  // async createOne(data, { transaction } = {}) {
  //   try {
  //     const modelAttributes = BaseService.getModelAttributes(this.model);
  //     const finalData = Object.fromEntries(
  //       Object.entries(data).filter(([key]) => modelAttributes.includes(key) || this.model.associations[key])
  //     );

  //     // 🔍 Detect nested includes
  //     const nestedIncludes = BaseService.resolveNestedIncludes(this.model, data);

  //     const item = await this.model.create(finalData, {
  //       include: nestedIncludes.length ? nestedIncludes : undefined,
  //       transaction,
  //     });

  //     if (!item) throw new BaseError(`Error adding new ${this.name}.`, 400);

  //     return item;
  //   } catch (ex) {
  //     error(ex);
  //     throw new BaseError(
  //       ex.message || `Error adding new ${this.name}.`,
  //       ex.statusCode || ex.code || 400
  //     );
  //   }
  // }

  /**
   * Updates a single record in the database table of the model.
   *
   * @author Ujjwal Bera
   * @param {object} query - Query parameters to filter the records
   * @param {object} data - Data to update in the record
   * @param {{filter: object, transaction: object, user: object, returning: boolean}} [options] - Options to customize the query
   * @returns {Promise<object>} The updated record
   * @throws {BaseError} If the record is not found or if there is an error in the update query
   */
  async update(
    query,
    data,
    { filter = null, transaction, user, returning = true } = {}
  ) {
    try {
      filter = filter || BaseService.generateQueryFilterFromQueryParams(query);
      const dbItem = await this.findOne(null, { filter, transaction });
      if (!dbItem)
        throw new BaseError(`Error fetching ${this.name} details.`, 500);

      const modelAttributes = BaseService.getModelAttributes(this.model);
      const finalData = Object.fromEntries(
        Object.entries(data).filter(([key]) => modelAttributes.includes(key))
      );

      Object.keys(finalData).forEach(
        (key) => finalData[key] === undefined && delete finalData[key]
      );

      //return await dbItem.update(data, { transaction, returning: true });
      //return this.findOne(null, { filter, transaction });
      const [count, rows] = await this.model.update(finalData, {
        where: filter,
        transaction,
        returning,
        individualHooks: true,
        userID: parseInt(user.id),
      });

      const relationData = Object.fromEntries(
        Object.entries(data).filter(([key]) => !modelAttributes.includes(key))
      );

      const associations = await this.getModelAssociations(this.model);
      for (const association of associations) {
        if (association.type === 'BelongsToMany') {
          const associationAsKey = Base.toSnakeCasePluralize(association.as);
          if (
            relationData.hasOwnProperty(associationAsKey) &&
            // Array.isArray(relationData.associationAsKey) &&
            relationData[associationAsKey].length > 0
          ) {
            for (const item of rows) {
              await item[association.accessors.remove](
                relationData[associationAsKey],
                {
                  transaction,
                  individualHooks: true,
                  userID: parseInt(user.id),
                }
              );

              item[association.accessors.set] = await item[
                association.accessors.set
              ](relationData[associationAsKey], {
                transaction,
                individualHooks: true,
                userID: parseInt(user.id),
              });
            }
          }
        }
      }

      if (count > 0) return rows;
      return null;
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || `Error updating ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  /**
   * Update a single record in the database with the given id.
   *
   * @author Ujjwal Bera
   * @param {Number} id - The id of the record to update.
   * @param {Object} data - The data to update the record with.
   * @param {Object} [options] - The options for the update query.
   * @param {Sequelize.Transaction} [options.transaction] - The transaction to run the update query in.
   * @param {User} [options.user] - The user performing the update.
   * @param {Boolean} [options.returning=true] - Whether to return the updated record.
   * @returns {Promise<Model>} - The updated record.
   * @throws {BaseError} - If the update query fails.
   */
  async updateByPk(id, data, { transaction, user, returning = true }) {
    try {
      const filter = { id };
      return await this.update(null, data, {
        filter,
        transaction,
        user,
        returning,
      });
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || `Error updating ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  /**
   * Updates multiple records in the database with the given query parameters.
   *
   * @author Ujjwal Bera
   * @param {Object} query - The query parameters for fetching records.
   * @param {Object} data - The data to update the record with.
   * @param {Object} [options] - The options for the update query.
   * @param {Sequelize.Transaction} [options.transaction] - The transaction to run the update query in.
   * @param {User} [options.user] - The user performing the update.
   * @returns {Promise<Array<Model>>} - The updated records.
   * @throws {BaseError} - If the update query fails.
   */
  async updateMultiple(query, data, { filter = null, transaction, user } = {}) {
    try {
      filter = filter || BaseService.generateQueryFilterFromQueryParams(query);
      const dbItems = await this.findAll(null, { filter, transaction });
      if (!dbItems)
        throw new BaseError(`Error fetching ${this.name} details.`, 500);
      if (dbItems.count < 1) throw new BaseError(`No ${this.name} found.`, 404);

      const modelAttributes = BaseService.getModelAttributes(this.model);

      const finalData = Object.fromEntries(
        Object.entries(data).filter(([key]) => modelAttributes.includes(key))
      );

      Object.keys(finalData).forEach(
        (key) => finalData[key] === undefined && delete finalData[key]
      );
      const relationData = Object.fromEntries(
        Object.entries(data).filter(([key]) => !modelAttributes.includes(key))
      );

      // const [count, rows] = await Promise.all(
      //   dbItems.map((record) =>
      //     record.update(data, { transaction, returning: true })
      //   )
      // );
      // if (count > 0) return rows;
      // return null;
      //
      const results = await Promise.all(
        dbItems.rows.map((record) =>
          record.update(finalData, {
            transaction,
            returning: true,
            individualHooks: true,
            userID: parseInt(user.id),
          })
        )
      );

      const associations = await this.getModelAssociations(this.model);
      for (const association of associations) {
        if (association.type === 'BelongsToMany') {
          const associationAsKey = Base.toSnakeCasePluralize(association.as);
          if (
            relationData.hasOwnProperty(associationAsKey) &&
            // Array.isArray(relationData.associationAsKey) &&
            relationData[associationAsKey].length > 0
          ) {
            for (const item of results) {
              await item[association.accessors.remove](
                relationData[associationAsKey],
                {
                  transaction,
                  individualHooks: true,
                  userID: parseInt(user.id),
                }
              );

              item[association.accessors.set] = await item[
                association.accessors.set
              ](relationData[associationAsKey], {
                transaction,
                individualHooks: true,
                userID: parseInt(user.id),
              });
            }
          }
        }
      }

      return results;
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || `Error updating ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  /**
   * Toggles the status of a record identified by its primary key.
   * Utilizes a literal SQL expression to invert the current status value.
   *
   * @author Ujjwal Bera
   * @param {Number} id - The primary key of the record to update.
   * @param {Object} options - The options for the update query.
   * @param {Sequelize.Transaction} [options.transaction] - The transaction to run the update query in.
   * @param {User} [options.user] - The user performing the update.
   * @returns {Promise<Array<Model>>|null} - The updated record(s) if successful, otherwise null.
   * @throws {BaseError} - If the update query fails.
   */

  async switchStatusByPk(id, { transaction, user }) {
    try {
      const [count, rows] = await this.model.update(
        { status: Sequelize.literal('NOT status') },
        {
          where: { id },
          transaction,
          individualHooks: true,
          userID: parseInt(user.id),
          returning: true,
        }
      );
      if (count > 0) return rows;
      return null;
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || `Error updating ${this.name} status.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  /**
   * Updates a record if it exists, otherwise creates a new one.
   * Utilizes a literal SQL expression to update the record if it exists.
   *
   * @author Ujjwal Bera
   * @param {Object} query - The query parameters for fetching the record.
   * @param {Object} data - The data to update the record with.
   * @param {Object} [options] - The options for the update/create query.
   * @param {Sequelize.Transaction} [options.transaction] - The transaction to run the update query in.
   * @param {User} [options.user] - The user performing the update.
   * @returns {Promise<Array<Model>>|null} - The updated/created record if successful, otherwise null.
   * @throws {BaseError} - If the update query fails.
   */
  async updateOrCreate(query, data, { filter = null, transaction, user } = {}) {
    try {
      filter = filter || BaseService.generateQueryFilterFromQueryParams(query);
      const dbItem = await this.findOne(null, { filter, transaction });

      Object.keys(data).forEach(
        (key) => data[key] === undefined && delete data[key]
      );
      if (!dbItem) {
        return await this.createOne(data, { transaction, user });
      }
      return await dbItem.update(data, {
        transaction,
        returning: true,
        userID: parseInt(user.id),
      });
      //return this.findOne(null, { filter, transaction });
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || `Error updating ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  /**
   * Deletes a single record based on the provided query parameters.
   * Utilizes the model's destroy method to remove the record from the database.
   * Throws a BaseError if the item is not found or if an error occurs during the delete process.
   *
   * @author Ujjwal Bera
   * @param {Object} query - The query parameters for fetching the record to delete.
   * @param {Object} [options] - Additional options for the delete operation.
   * @param {Object} [options.filter=null] - Filter criteria for the record search.
   * @param {Sequelize.Transaction} [options.transaction] - Transaction context for the operation.
   * @param {User} [options.user] - User context for the operation.
   * @returns {Promise<Object>} - A promise that resolves to the deleted record.
   * @throws {BaseError} - If the item is not found or an error occurs during deletion.
   */

  async destroy(query, { filter = null, transaction, user } = {}) {
    try {
      filter = filter || BaseService.generateQueryFilterFromQueryParams(query);
      const dbItem = await this.findOne(null, { filter, transaction, user });
      if (!dbItem)
        throw new BaseError(`Error in fetching ${this.name} details.`, 500);
      await this.model.destroy({
        where: filter,
        transaction,
        individualHooks: true,
        userID: parseInt(user.id),
      });
      return dbItem;
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || `Error in deleting ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  /**
   * Deletes a single record based on its primary key.
   * Utilizes the model's destroy method to remove the record from the database.
   * Throws a BaseError if the item is not found or if an error occurs during the delete process.
   *
   * @author Ujjwal Bera
   * @param {Number} id - The primary key of the record to delete.
   * @param {Object} [options] - Additional options for the delete operation.
   * @param {Sequelize.Transaction} [options.transaction] - Transaction context for the operation.
   * @param {User} [options.user] - User context for the operation.
   * @returns {Promise<Object>} - A promise that resolves to the deleted record.
   * @throws {BaseError} - If the item is not found or an error occurs during deletion.
   */
  async deleteById(id, { transaction, user }) {
    try {
      const filter = { id };
      return await this.destroy(null, {
        filter,
        transaction,
        userID: parseInt(user.id),
      });
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || `Error in deleting ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  static generateQueryFilterFromQueryParams1(query) {
    try {
      const filters = Object.entries(query).reduce((acc, [field, value]) => {
        if (!value) return acc;
        if (field === 'ids') acc.push({ id: value.split(',') });
        else if (field === 'keyword')
          acc.push({ name: { [Op.like]: `%${value}%` } });
        else if (!isNaN(value)) acc.push({ [field]: Number(value) });
        else if (['true', 'false'].includes(value.toLowerCase()))
          acc.push({ [field]: value.toLowerCase() === 'true' });
        else acc.push({ [field]: { [Op.like]: `%${value}%` } });
        return acc;
      }, []);
      return { [Op.and]: filters };
    } catch (ex) {
      if (this.getEnv('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || 'Error generating query.',
        ex.statusCode || ex.code || 400
      );
    }
  }

  static generateQueryFilterFromQueryParams(query) {
    try {
      const filters = [];

      for (const [field, rawValue] of Object.entries(query)) {
        if (rawValue === undefined || rawValue === null || rawValue === '')
          continue;

        const value = String(rawValue).trim();

        // ✅ Special cases
        if (field === 'ids') {
          filters.push({ id: value.split(',').map((v) => v.trim()) });
          continue;
        }

        if (field === 'keyword') {
          filters.push({ name: { [Op.like]: `%${value}%` } });
          continue;
        }

        // ✅ Number handling
        if (!isNaN(value) && value !== '') {
          filters.push({ [field]: Number(value) });
          continue;
        }

        // ✅ Boolean handling
        if (['true', 'false'].includes(value.toLowerCase())) {
          filters.push({ [field]: value.toLowerCase() === 'true' });
          continue;
        }

        // ✅ Array (comma separated values)
        if (value.includes(',')) {
          filters.push({
            [field]: { [Op.in]: value.split(',').map((v) => v.trim()) },
          });
          continue;
        }

        // ✅ Fallback: partial match
        filters.push({ [field]: { [Op.like]: `%${value}%` } });
      }

      return filters.length ? { [Op.and]: filters } : {};
    } catch (ex) {
      if (this.getEnv?.('APP_DEBUG')) error(ex);
      throw new BaseError(
        ex.message || 'Error generating query.',
        ex.statusCode || ex.code || 400
      );
    }
  }

  /**
   * Retrieves and processes the associations of a given model.
   *
   * This method iterates over all associations of the provided model,
   * filtering out those without options. For each association with options,
   * it gathers relevant details such as accessors, type, model, and attributes.
   * It also handles associations of type 'BelongsToMany' by including details
   * about the 'through' table if applicable.
   *
   * @author Ujjwal Bera
   * @param {Object} model - The model whose associations are being retrieved.
   * @returns {Promise<Array<Object>>} - A promise that resolves to an array of
   * objects containing details of each association.
   * @throws {BaseError} - If an error occurs while processing the associations.
   */

  async getModelAssociations(model) {
    const associations = Object.values(model.associations)
      .filter((assoc) => assoc.options)
      .map(async (assoc) => {
        const attributes = BaseService.getModelAttributes(assoc.target);
        return {
          accessors: assoc.accessors,
          isSelfAssociation: assoc.isSelfAssociation,
          type: assoc.associationType,
          model: assoc.target,
          where: assoc.scope,
          as: assoc.as,
          auto: !!assoc.options.auto,
          required: !!assoc.options.required,
          attributes: assoc.options.attributes || attributes,
          through: assoc.options.through
            ? {
                where: assoc.options.through.scope,
                attributes: assoc.options.through.attributes || [],
              }
            : undefined,
        };
      });

    return Promise.all(associations); // Await all mapped async functions
  }

  async buildAssociations(modelAssociations) {
    return Promise.all(
      modelAssociations
        .filter((assoc) => assoc?.auto) // Filter only auto associations
        .map(async (assoc) => ({
          model: assoc.model,
          as: assoc.as,
          where: assoc.where || {},
          required: assoc.required,
          attributes: await assoc.attributes, // Ensure attributes is resolved if async
          ...(assoc.type === 'BelongsToMany' && { through: assoc.through }),
        }))
    );
  }

  async getAutoIncludes(model) {
    return this.buildAssociations(await this.getModelAssociations(model));
  }

  static getModelAttributes(model) {
    return Object.keys(model.rawAttributes);
  }

  static mergeIncludes(inputIncludes, autoIncludes) {
    const merged = [];
    const seenAs = new Set();

    [...inputIncludes, ...autoIncludes].forEach((item) => {
      if (!seenAs.has(item.as)) {
        seenAs.add(item.as);
        merged.push(item);
      }
    });

    return merged;
  }

  static resolveNestedIncludes(model, data) {
    const includes = [];

    if (!model || !model.associations) return includes;

    for (const assocName in model.associations) {
      const assoc = model.associations[assocName];
      const key = assoc.as; // alias used in data

      if (data[key]) {
        includes.push({
          model: assoc.target,
          as: key,
        });
      }
    }

    return includes;
  }

  static resolveNestedIncludesRecursive(model, data) {
    const includes = [];

    if (!model || !model.associations) return includes;

    for (const assocName in model.associations) {
      const assoc = model.associations[assocName];
      const key = assoc.as;

      if (data[key]) {
        includes.push({
          model: assoc.target,
          as: key,
          include: BaseService.resolveNestedIncludesRecursive(
            assoc.target,
            data[key][0] || data[key]
          ),
        });
      }
    }

    return includes;
  }
}

export default BaseService;
