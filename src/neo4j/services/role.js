import moment from 'moment';
import neo4j from '../../libraries/neo4j.library.js';
import cypher from '../cyphers/index.js';
import { BaseError } from '../../system/core/error/baseError.js';

export default {
    create: async (data) => {
        try {
            const cypherScript = cypher(`role/create-role`);
            const graphData = {
                _id: data.id || 'null',
                parent: data.parent || 'null',
                name: data.name || 'null',
                slug: data.slug || 'null',
                rights: data.rights?.filter(x => !!x) || [],
                deleted: data.deleted || false,
                status: data.status || false,
                createdAt: data.createdAt ? moment(data.createdAt).format("YYYY-MM-DD HH:mm:ss") : 'null',
                updatedAt: data.updatedAt ? moment(data.updatedAt).format("YYYY-MM-DD HH:mm:ss") : 'null'
            };

            const role = await neo4j.write(cypherScript, graphData);

            if (data.parent) {
                const relationData = {
                    child: data.id,
                    parent: data.parent,
                    date: data.createdAt ? moment(data.createdAt).format("YYYY-MM-DD HH:mm:ss") : 'null'
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
                            right: JSON.stringify(rightDetails)
                        };
                        const rightScript = cypher(`role/set-rights`);
                        await neo4j.write(rightScript, rightData);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            throw new BaseError(err.message);
        }
    },
    get: async (email) => {
        try {
            const cypherScript = cypher(`user/get-user-by-email`);
            await neo4j.write(cypherScript, email);
        } catch (err) {
            throw new BaseError(err.message);
        }
    },
    getUserByEmail: async (email) => {
        try {
            const cypherScript = cypher(`user/get-user-by-email`);
            await neo4j.write(cypherScript, email);
        } catch (err) {
            throw new BaseError(err.message);
        }
    },
    getUserById: async (id) => {
        try {
            const cypherScript = cypher(`user/get-user-by-id`);
            await neo4j.write(cypherScript, id);
        } catch (err) {
            throw new BaseError(err.message);
        }
    },
    update: async (email, user) => {
        try {
            const cypherScript = cypher(`user/get-user-by-email`);
            await neo4j.write(cypherScript, email);
        } catch (err) {
            throw new BaseError(err.message);
        }
    },
    updateUserByEmail: async (email, user) => {
        try {
            const cypherScript = cypher(`user/get-user-by-email`);
            await neo4j.write(cypherScript, email);
        } catch (err) {
            throw new BaseError(err.message);
        }
    },
    updateUserById: async (id) => {
        try {
            const cypherScript = cypher(`user/get-user-by-id`);
            await neo4j.write(cypherScript, id);
        } catch (err) {
            throw new BaseError(err.message);
        }
    },
    deleteUserById: async (id) => {
        try {
            const cypherScript = cypher(`user/get-user-by-id`);
            await neo4j.write(cypherScript, id);
        } catch (err) {
            throw new BaseError(err.message);
        }
    },
};
