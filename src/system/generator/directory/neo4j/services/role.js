import moment from 'moment';
import neo4j from '../../libraries/neo4j.library.js';
import cypher from '../cyphers/index.js';
import { BaseError } from '../../system/core/error/baseError.js';
import { error } from '../helpers/logger.js';

export default {
  create: async (data) => {
    try {
      const cypherScript = cypher(`role/create-role`);
      const graphData = {
        _id: data.id || 'null',
        parent: data.parent || 'null',
        name: data.name || 'null',
        slug: data.slug || 'null',
        rights: data.rights?.filter((x) => !!x) || [],
        deleted: data.deleted || false,
        status: data.status || false,
        createdAt: data.createdAt ? moment(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : 'null',
        updatedAt: data.updatedAt ? moment(data.updatedAt).format('YYYY-MM-DD HH:mm:ss') : 'null',
      };

      await neo4j.write(cypherScript, graphData);

      if (data.parent) {
        const relationData = {
          child: data.id,
          parent: data.parent,
          date: data.createdAt ? moment(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : 'null',
        };
        const relationScript = cypher(`role/create-parent-child-relation`);
        await neo4j.write(relationScript, relationData);
      }

      const rights = data?.rights;
      if (rights && rights.length > 0) {
        for (const right of rights) {
          if (!right.fullDeny) {
            const { resource, ...rightDetails } = right;
            const rightData = {
              role: data.id,
              resource,
              right: JSON.stringify(rightDetails),
            };
            const rightScript = cypher(`role/set-rights`);
            await neo4j.write(rightScript, rightData);
          }
        }
      }
    } catch (ex) {
      error(ex);
      throw new BaseError(ex);
    }
  },
  get: async (email) => {
    try {
      const cypherScript = cypher(`user/get-user-by-email`);
      await neo4j.write(cypherScript, email);
    } catch (ex) {
      throw new BaseError(ex);
    }
  },
  getUserByEmail: async (email) => {
    try {
      const cypherScript = cypher(`user/get-user-by-email`);
      await neo4j.write(cypherScript, email);
    } catch (ex) {
      throw new BaseError(ex);
    }
  },
  getUserById: async (id) => {
    try {
      const cypherScript = cypher(`user/get-user-by-id`);
      await neo4j.write(cypherScript, id);
    } catch (ex) {
      throw new BaseError(ex);
    }
  },
  update: async (email) => {
    try {
      const cypherScript = cypher(`user/get-user-by-email`);
      await neo4j.write(cypherScript, email);
    } catch (ex) {
      throw new BaseError(ex);
    }
  },
  updateUserByEmail: async (email) => {
    try {
      const cypherScript = cypher(`user/get-user-by-email`);
      await neo4j.write(cypherScript, email);
    } catch (ex) {
      throw new BaseError(ex);
    }
  },
  updateUserById: async (id) => {
    try {
      const cypherScript = cypher(`user/get-user-by-id`);
      await neo4j.write(cypherScript, id);
    } catch (ex) {
      throw new BaseError(ex);
    }
  },
  deleteUserById: async (id) => {
    try {
      const cypherScript = cypher(`user/get-user-by-id`);
      await neo4j.write(cypherScript, id);
    } catch (ex) {
      throw new BaseError(ex);
    }
  },
};
