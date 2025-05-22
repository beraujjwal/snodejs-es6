'use strict';
import 'dotenv/config';
import os from 'os';

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const CORS_ENABLED = process.env.CORS_ENABLED === 'true';
export const APP_DEBUG = process.env.APP_DEBUG === 'true';
export const APP_PORT = Number(process.env.APP_PORT) || 4060;
export const DB_PORT = Number(process.env.DB_PORT) || 5432;
export const DB_SYNC = process.env.DB_SYNC === 'true';
export const DB_QUERY_LOG = process.env.DB_QUERY_LOG === 'true';
export const DATA_PER_PAGE = Number(process.env.DATA_PER_PAGE) || 20;

export const BLOCK_LOGIN_ATTEMPTS =
  Number(process.env.BLOCK_LOGIN_ATTEMPTS) || 5;
export const RESET_PASSWORD_TOKEN_EXPIRES_IN =
  Number(process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN) || 43800;
export const SIGNIN_TOKEN_EXPIRES_IN =
  Number(process.env.SIGNIN_TOKEN_EXPIRES_IN) || 43800;
export const VERIFICATION_TOKEN_EXPIRES_IN =
  Number(process.env.VERIFICATION_TOKEN_EXPIRES_IN) || 43800;

export const MAX_REQUEST_LIMIT = Number(process.env.MAX_REQUEST_LIMIT) || 100;
export const MAX_REQUEST_IN_TIME =
  Number(process.env.MAX_REQUEST_IN_TIME) || 60 * 60 * 1000;

export const EMAIL_PORT = Number(process.env.EMAIL_PORT) || 2525;
export const EMAIL_SMTP_SECURE = process.env.EMAIL_SMTP_SECURE === 'true';

export const IS_OTP_BASE_SIGNIN = process.env.IS_OTP_BASE_SIGNIN === 'true';
export const MULTI_LOGIN = process.env.MULTI_LOGIN === 'true';

export const SENTRY_TRACES_SAMPLE_RATE =
  parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE) || 1.0;

export const KAFKA_RETRT = Number(process.env.KAFKA_RETRT) || 10;
export const KAFKA_RETRT_TIME = Number(process.env.KAFKA_RETRT_TIME) || 2500;

export const KAFKA_SUBSCRIBE_TOPICS = process.env.KAFKA_SUBSCRIBE_TOPICS.split(
  ','
).map((topic) => topic.trim());

export const REDIS_PORT = Number(process.env.REDIS_PORT) || 6379;

//export const KAFKA_CLIENT_ID = `${process.env.KAFKA_CLIENT_ID  }-${os.hostname()}-${Math.random().toString(36).substring(2, 8)}`;

export const {
  APP_NAME,
  APP_ENV,
  APP_KEY,
  APP_URL,
  APP_TIMEZONE,

  DB_DIALECT,
  DB_HOST,
  DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,

  JWT_SECRET,
  JWT_REFRESH_TOKEN_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,

  CRYEPTO_SECRET_KEY,
  CRYEPTO_IV_KEY,

  EMAIL_HOST,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  DEFAULT_EMAIL,
  DEFAULT_SUBJECT,

  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
  AWS_ACCESS_KEY,
  AWS_SECRET_KEY,
  FILE_TEMP_PATH,

  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_VERIFY_SID,

  SENTRY_DSN,

  IPGEOLOCATION_KEY,
  IPGEOLOCATION_URL,

  KAFKA_BROKERS,
  KAFKA_CLIENT_ID,
  KAFKA_GROUP_ID,

  REDIS_HOST,
  REDIS_EXPIRES_IN,
  REDIS_PASSWORD,
} = process.env;
