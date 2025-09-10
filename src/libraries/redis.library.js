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
    const stringifiedValue = isPlainObject(value)
      ? JSON.stringify(value)
      : value;
    const expiresIn = getExpiresInTime(timeout);
    await redisClient.set(key, stringifiedValue, { EX: expiresIn });
    return true;
  } catch (ex) {
    console.error('Redis Set Value Error:', ex);
    return true;
  }
};

export const getValue = async (key) => {
  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    return JSON.parse(value);
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

export const incrementValue = async (key, ttl = 60) => {
  try {
    const count = await redisClient.incr(key);
    if (count === 1) await redisClient.expire(key, ttl); // Set TTL only on first increment
    return count;
  } catch (ex) {
    console.error('Redis Incr Error:', ex);
    return 0;
  }
};

const getExpiresInTime = (expiresIn) => {
  if (typeof expiresIn === 'number') return expiresIn;

  const redisExpiresIn = expiresIn || config.expires || '5m';
  const redisExpiresInInt = parseInt(redisExpiresIn, 10);
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

const isPlainObject = (value) => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.prototype.toString.call(value) === '[object Object]'
  );
};
