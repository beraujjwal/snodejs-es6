'use strict';
import chalk from 'chalk';
import { createClient } from 'redis';

import config from '../config/redis.config.js';

let redisClient = null;

if (config.url) {
  redisClient = createClient({
    url: config.url,
    password: config.password, // Add password here
  });

  redisClient.on('error', (ex) => {
    console.log(chalk.white.bgRed.bold('✘ Redis client setup process failed!'));
    console.error('Redis Client Error:', ex);
  });

  await redisClient.connect();
}

export { redisClient };
