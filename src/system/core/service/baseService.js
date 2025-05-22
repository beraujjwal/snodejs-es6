'use strict';
import { Sequelize, Op } from 'sequelize';
import Base from '../base/index.js';
import { BaseError } from '../error/baseError.js';

class BaseService extends Base {
  constructor(model) {
    super();
    this.model = this.getModel(model);
    this.name = model;
  }

  static getInstance(model) {
    if (!this.instance) {
      this.instance = new BaseService(model);
    }
    return this.instance;
  }

  async findAll(
    {
      order_by = 'id',
      ordering = 'DESC',
      limit = this.getEnv('DATA_PER_PAGE') || 10,
      page = 1,
      order_by_can_have_null = false,
      ...query
    },
    { filter = null, include = [], attributes, transaction } = {}
  ) {
    try {
      let pagination = {};
      attributes = attributes || (await this.getModelAttributes(this.model));
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

      filter = filter || (await this.generateQueryFilterFromQueryParams(query));
      const mergedIncludes = await this.mergeIncludes(
        include,
        await this.getAutoIncludes(this.model)
      );

      if (limit !== 0) {
        pagination = { limit, offset };
      }

      const [rows, total] = await Promise.all([
        this.model.findAll({
          attributes,
          where: filter,
          include: mergedIncludes,
          order: orderingCondition,
          ...pagination,
          transaction,
        }),
        this.model.count({ where: filter, transaction }),
      ]);

      const rowsData = rows.map((item) => item.toJSON());

      return {
        count: rows.length,
        limit,
        page,
        range: [offset + 1, offset + rows.length],
        rows: rowsData,
        total,
      };
    } catch (ex) {
      throw new BaseError(
        ex.message || `Error fetching ${this.name}s list.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  async findOne(
    query,
    { filter = null, include = [], attributes, transaction } = {}
  ) {
    try {
      attributes = attributes || (await this.getModelAttributes(this.model));
      filter = filter || (await this.generateQueryFilterFromQueryParams(query));
      const mergedIncludes = await this.mergeIncludes(
        include,
        await this.getAutoIncludes(this.model)
      );

      const item = await this.model.findOne({
        attributes,
        where: filter,
        include: mergedIncludes,
        transaction,
      });
      if (!item) throw new BaseError(`${this.name} not found.`, 404);
      const itemData = item?.toJSON();
      return itemData;
    } catch (ex) {
      throw new BaseError(
        ex.message || `Error fetching ${this.name} details.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  async findByPk(id, { transaction, include, attributes }) {
    try {
      const filter = { id };
      return this.findOne(null, { filter, include, attributes, transaction });
    } catch (ex) {
      throw new BaseError(
        ex.message || `Error fetching ${this.name} details.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  async createOne(data, { transaction } = {}) {
    try {
      const modelAttributes = await this.getModelAttributes(this.model);
      const finalData = Object.fromEntries(
        Object.entries(data).filter(([key]) => modelAttributes.includes(key))
      );
      const item = await this.model.create(finalData, { transaction });
      if (!item) throw new BaseError(`Error adding new ${this.name}.`, 400);
      const itemData = item?.toJSON();
      return itemData;
      //return item;
    } catch (ex) {
      throw new BaseError(
        ex.message || `Error adding new ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  async update(query, data, { filter = null, transaction } = {}) {
    try {
      filter = filter || (await this.generateQueryFilterFromQueryParams(query));
      const dbItem = await this.findOne(null, { filter, transaction });
      if (!dbItem)
        throw new BaseError(`Error fetching ${this.name} details.`, 500);

      Object.keys(data).forEach(
        (key) => data[key] === undefined && delete data[key]
      );
      await this.model.update(data, { where: filter, transaction });
      return this.findOne(null, { filter, transaction });
    } catch (ex) {
      throw new BaseError(
        ex.message || `Error updating ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  async updateByPk(id, data, { transaction }) {
    try {
      const filter = { id };
      return await this.update(null, data, { filter, transaction });
    } catch (ex) {
      throw new BaseError(
        ex.message || `Error updating ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  async destroy(query, { filter = null, transaction } = {}) {
    try {
      filter = filter || (await this.generateQueryFilterFromQueryParams(query));
      const dbItem = await this.findOne(null, { filter, transaction });
      if (!dbItem)
        throw new BaseError(`Error in fetching ${this.name} details.`, 500);
      await this.model.destroy({ where: filter, transaction });
      return dbItem;
    } catch (ex) {
      throw new BaseError(
        ex.message || `Error in deleting ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  async destroyByPk(id, { transaction }) {
    try {
      const filter = { id };
      return await this.destroy(null, { filter, transaction });
    } catch (ex) {
      throw new BaseError(
        ex.message || `Error in deleting ${this.name}.`,
        ex.statusCode || ex.code || 400
      );
    }
  }

  async generateQueryFilterFromQueryParams(query) {
    try {
      return Object.entries(query).reduce((acc, [field, value]) => {
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
    } catch (ex) {
      throw new BaseError(
        ex.message || 'Error generating query.',
        ex.statusCode || ex.code || 400
      );
    }
  }

  async getModelAssociations(model) {
    const associations = Object.values(model.associations)
      .filter((assoc) => assoc.options)
      .map(async (assoc) => {
        const attributes = await this.getModelAttributes(assoc.target);
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

  async getModelAttributes(model) {
    return Object.keys(model.rawAttributes);
  }

  async mergeIncludes(inputIncludes, autoIncludes) {
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
}

export default BaseService;
