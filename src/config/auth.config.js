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
    'G5rU7!eDzN1L!xgZ4Qm@bTCv8WsJh2kPf9YrAiLdKoEwMtXsV4a531b6ffecauRzNyQ',
  refreshSecret:
    JWT_REFRESH_TOKEN_SECRET ||
    'Mn4XpT!7qWzLvJ2Ek8RyFgUa@DoKiBsC6f1185b7xNpZtHvGlY5RmAcVs',
  expiresIn: JWT_EXPIRES_IN || '10m',
  refreshExpiresIn: JWT_REFRESH_EXPIRES_IN || '30d',
};
