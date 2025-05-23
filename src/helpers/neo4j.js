'use strict';
import neo4j from 'neo4j-driver';

import config from '../config/neo4j.config.js';
let neo4jDriver = null;

if(config.url) {
    neo4jDriver = neo4j.driver(
        config.url,
        neo4j.auth.basic(config.username, config.password),
        {
            disableLosslessIntegers: true,
            maxConnectionLifetime: 60 * 60 * 1000, // 1 hour
            maxConnectionPoolSize: 300,
            //encrypted: "ENCRYPTION_ON",
            //trust: "TRUST_CUSTOM_CA_SIGNED_CERTIFICATES",
            //trustedCertificates: [process.env.NEO4J_TRUSTED_CERTS],
            logging: {
                level: 'debug',
                logger: (level, message) => log('Neo4J Connected successfully!') //log('+++' + level + ' ' + message)
            }
        }
    );
}


export { neo4jDriver };