'use strict';
import neo4j from 'neo4j-driver';
import config from '../config/neo4j.config.js';

import { BaseError }from '../system/core/error/baseError';
import { neo4jDriver } from '../helpers/neo4j';

export default {
    read: async (cypher, params = {}) => {
        const session = neo4jDriver.session({
            config,
            defaultAccessMode: neo4j.session.READ
        });

        const txc = session.beginTransaction();

        return await txc.run(cypher, params).then( async(result) => {
            await txc.commit();
            return result;
        }).catch(async(ex) => {
            await txc.rollback();
            error(ex.message);
            throw new BaseError(ex);
        }).finally( async() => {
            await session.close()
        });
    },
    write: async (cypher, params = {}) => {
        const session = neo4jDriver.session({
            config,
            defaultAccessMode: neo4j.session.WRITE
        });
        const txc = session.beginTransaction();

        return await txc.run(cypher, params).then(async(result) => {
            await txc.commit();
            return result.records;
        }).catch(async(ex) => {
            await txc.rollback();
            error(ex.message);
            throw new BaseError(ex);
        }).finally( async() => {
            await session.close()
        });
    },
}