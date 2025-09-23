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
                blockExpires: data.blockExpires ? moment(data.blockExpires).format("YYYY-MM-DD HH:mm:ss") : 'null',
                createdAt: data.createdAt ? moment(data.createdAt).format("YYYY-MM-DD HH:mm:ss") : 'null',
            };

            await neo4j.write(cypherScript, graphUser);
        } catch (err) {
            throw new BaseError(err);
        }
    },
    get: async (email) => {
        try {
            const cypherScript = cypher(`user/get-user-by-email`);
            await neo4j.write(cypherScript, email);
        } catch (err) {
            throw new BaseError(err);
        }
    },
    getUserByEmail: async (email) => {
        try {
            const cypherScript = cypher(`user/get-user-by-email`);
            await neo4j.write(cypherScript, email);
        } catch (err) {
            throw new BaseError(err);
        }
    },
    getUserById: async (id) => {
        try {
            const cypherScript = cypher(`user/get-user-by-id`);
            await neo4j.write(cypherScript, id);
        } catch (err) {
            throw new BaseError(err);
        }
    },
    update: async (email, user) => {
        try {
            const cypherScript = cypher(`user/get-user-by-email`);
            await neo4j.write(cypherScript, email);
        } catch (err) {
            throw new BaseError(err);
        }
    },
    updateUserByEmail: async (email, user) => {
        try {
            const cypherScript = cypher(`user/get-user-by-email`);
            await neo4j.write(cypherScript, email);
        } catch (err) {
            throw new BaseError(err);
        }
    },
    updateUserById: async (id) => {
        try {
            const cypherScript = cypher(`user/get-user-by-id`);
            await neo4j.write(cypherScript, id);
        } catch (err) {
            throw new BaseError(err);
        }
    },
    deleteUserById: async (id) => {
        try {
            const cypherScript = cypher(`user/get-user-by-id`);
            await neo4j.write(cypherScript, id);
        } catch (err) {
            throw new BaseError(err);
        }
    },
};
