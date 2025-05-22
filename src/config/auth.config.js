'use strict';
import {
  JWT_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
} from './config.js';

export const authConfig = {
  secret:
    JWT_SECRET ||
    'Laid1DP7PxiA6GofhxVw87jWkRsHEnaEPd0vYRg70lT7pxfDODzK0Wc3LDxYYd6W',
  refreshSecret:
    JWT_REFRESH_TOKEN_SECRET ||
    'd100db699c6f9844824493a2ab83cc2c216955b0546f1185b7c5b1e0630c192c',
  expiresIn: JWT_EXPIRES_IN || '10m',
  refreshExpiresIn: JWT_REFRESH_EXPIRES_IN || '30d',
};
