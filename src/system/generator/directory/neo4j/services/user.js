import moment from 'moment';
import neo4j from '../../libraries/neo4j.library.js';
import cypher from '../cyphers/index.js';
import { BaseError } from '../../system/core/error/baseError.js';

export default {
  create: async (data) => {
    try {
      const cypherScript = cypher(`user/create-user`);
      const graphUser = {
        _id: data.id || 'null',
        name: data.name || 'null',
        phone: data.phone || 'null',
        roles: data.roles || [],
        email: data.email || 'null',
        isEmailVerified: data.isEmailVerified || false,
        isPhoneVerified: data.isPhoneVerified || false,
        status: data.status || false,
        verified: data.verified || false,
        blockExpires: data.blockExpires
          ? moment(data.blockExpires).format('YYYY-MM-DD HH:mm:ss')
          : 'null',
        createdAt: data.createdAt ? moment(data.createdAt).format('YYYY-MM-DD HH:mm:ss') : 'null',
      };

      await neo4j.write(cypherScript, graphUser);
    } catch (ex) {
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
