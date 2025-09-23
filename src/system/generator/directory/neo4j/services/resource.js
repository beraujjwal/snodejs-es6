import moment from 'moment';
import neo4j from '../../libraries/neo4j.library.js';
import cypher from '../cyphers/index.js';
import { BaseError } from '../../system/core/error/baseError.js';

export default {
    create: async (data) => {
        try {
            const cypherScript = cypher(`resource/create-resource`);
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

            if (data.parent) {
                const relationData = {
                    child: data.id,
                    parent: data.parent,
                    date: data.createdAt ? moment(data.createdAt).format("YYYY-MM-DD HH:mm:ss") : 'null'
                };
                const relationScript = cypher(`resource/create-parent-child-relation`);
                await neo4j.write(relationScript, relationData);
            }

            const rightsAvailable = data?.rightsAvailable;
            if (rightsAvailable?.length > 0) {
                for (const rightElement of rightsAvailable) {
                    const right = {
                        resource: data.id,
                        permission: rightElement,
                        permissionKey: rightElement,
                    };
                    const rightScript = cypher(`resource/set-rights-available`);
                    await neo4j.write(rightScript, right);
                }
            }
        } catch (err) {
            throw new BaseError(err.message);
        }
    },
    get: async (id) => {
        try {
            const cypherScript = cypher(`resource/get-resource-by-id`);
            await neo4j.write(cypherScript, id);
        } catch (err) {
            throw new BaseError(err.message);
        }
    },
    update: async (id, user) => {
        try {
            const cypherScript = cypher(`resource/update-resource-by-id`);
            await neo4j.write(cypherScript, id);
        } catch (err) {
            throw new BaseError(err.message);
        }
    },
    delete: async (id) => {
        try {
            const cypherScript = cypher(`resource/delete-resource-by-id`);
            await neo4j.write(cypherScript, id);
        } catch (err) {
            throw new BaseError(err.message);
        }
    },
};
