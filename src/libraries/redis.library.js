'use strict';

import config from '../config/redis.config.js';
import { redisClient } from '../helpers/redis.js';

export const keyExists = async (key) => {
  try {
    const exists = await redisClient.exists(key);
    return exists === 1; // Returns true if key exists, false otherwise
  } catch (ex) {
    console.error('Redis Exists Error:', ex);
    return false;
  }
};

export const setValue = async (key, value, timeout = '5m') => {
  try {
    const expiresIn = getExpiresInTime(timeout);
    await redisClient.set(key, value, { EX: expiresIn });
    return true;
  } catch (ex) {
    console.error('Redis Set Value Error:', ex);
    return true;
  }
};

export const getValue = async (key) => {
  try {
    return await redisClient.get(key);
  } catch (ex) {
    console.error(ex);
  }
};

export const deleteValue = async (key) => {
  try {
    return await redisClient.del(key);
  } catch (ex) {
    console.error(ex);
  }
};

const getExpiresInTime = (expiresIn) => {
  const redisExpiresIn = expiresIn || config.expires || '5m';
  const redisExpiresInInt = parseInt(redisExpiresIn);
  const redisExpiresString = redisExpiresIn
    .replace(redisExpiresInInt, '')
    .trim();

  switch (redisExpiresString) {
    case 'm':
      return redisExpiresInInt * 60;
    case 'h':
      return redisExpiresInInt * 60 * 60;
    case 'd':
      return redisExpiresInInt * 60 * 60 * 24;
    default:
      return redisExpiresInInt; // Default to seconds
  }
};
