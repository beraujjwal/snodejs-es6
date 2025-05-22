'use strict';
import { BaseError } from '../../system/core/error/baseError.js';
import BaseService from '../../system/core/service/baseService.js';

class Service extends BaseService {
  /**
   * Service constructor
   * @author Ujjwal Bera
   * @param null
   */
  constructor(model) {
    super(model);
    this.model = this.getModel(model);
  }

  async removeDuplicates(arr) {
    try {
      return [...new Set(arr)];
      //return arr.filter((item, index) => arr.indexOf(item) === index);
    } catch (ex) {
      throw new BaseError(ex.message);
    }
  }

  async updateNestedStatus(rootId, newStatus, { transaction }) {
    try {
      // Update status of the current node
      await this.model.update(
        { status: newStatus },
        { where: { id: rootId }, transaction }
      );

      // Find children of the current node
      const childrens = await this.model.findAll(
        { where: { parent: rootId }, transaction }
      );

      // Recursively update status for each child
      for (const children of childrens) {
        await this.updateNestedStatus(children.id, newStatus, { transaction });
      }
    } catch (ex) {
      throw new BaseError(ex.message);
    }
  }

  async listToTree(list) {
    try {
      const map = {};
      const roots = [];

      for (let i = 0; i < list.length; i += 1) {
        map[list[i]._id] = i;
        list[i].childrens = [];
      }

      for (let i = 0; i < list.length; i += 1) {
        const node = list[i];
        if (node.parent !== null && map[node.parent] !== undefined) {
          list[map[node.parent]].childrens.push(node);
        } else {
          roots.push(node);
        }
      }

      return roots;
    } catch (ex) {
      throw new BaseError(ex.message);
    }
  }

  async modifyIds(data) {
    try {
      return data.map((item) => {
        const { id, ...rest } = item;
        const newItem = { id, ...rest };

        // Recursively modify subchildren
        for (const key in newItem) {
          if (Array.isArray(newItem[key])) {
            newItem[key] = this.modifyIds(newItem[key]);
          }
        }

        return newItem;
      });
    } catch (ex) {
      throw new BaseError(ex.message);
    }
  }

  async isUnique(model, key, value, id = null) {
    const query = [];

    value = value.toLowerCase();
    value = value.replace(/[^a-zA-Z ]/g, '');
    value = value.replace(/[^a-zA-Z]/g, '-');

    if (value) {
      query.push({
        [key]: {
          [this.Op.eq]: value,
        },
      });
    }

    if (id != null) {
      query.push({
        id: {
          [this.Op.ne]: id,
        },
      });
    }

    return model.findOne({
      where: {
        [this.Op.and]: query,
      },
    });
  }
}

export default Service;
