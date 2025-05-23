import moment from 'moment';
import neo4j from '../../libraries/neo4j.library';
import cypher from '../cyphers';
import { BaseError } from '../../system/core/error/baseError';

export default {
    create: async (data) => {
        try {
            const cypherScript = cypher(`permission/create-permission`);
            const graphData = {
                _id: data.id || 'null',
                name: data.name || 'null',
                slug: data.slug || 'null',
                deleted: data.deleted || false,
                status: data.status || false,
                createdAt: data.createdAt ? moment(data.createdAt).format("YYYY-MM-DD HH:mm:ss") : 'null',
                updatedAt: data.updatedAt ? moment(data.updatedAt).format("YYYY-MM-DD HH:mm:ss") : 'null'
            };

            await neo4j.write(cypherScript, graphData);
        } catch (err) {
            throw new BaseError(err);
        }
    },
    get: async (id) => {
        try {
            const cypherScript = cypher(`permission/get-permission-by-id`);
            await neo4j.write(cypherScript, id);
        } catch (err) {
            throw new BaseError(err);
        }
    },
    update: async (email, user) => {
        try {
            const cypherScript = cypher(`user/update-permission-by-id`);
            await neo4j.write(cypherScript, email);
        } catch (err) {
            throw new BaseError(err);
        }
    },
    delete: async (id) => {
        try {
            const cypherScript = cypher(`user/delete-permission-by-id`);
            await neo4j.write(cypherScript, id);
        } catch (err) {
            throw new BaseError(err);
        }
    }
};
