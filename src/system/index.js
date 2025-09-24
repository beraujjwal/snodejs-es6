'use strict';
import 'dotenv/config';
import { URL } from 'url';
import express from 'express';
import { engine } from 'express-handlebars';
import * as useragent from 'express-useragent';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import logger from 'morgan';
import moment from 'moment-timezone';

import i18n from '../config/i18n.config.js';
import winston, { LoggerStream } from '../config/winston.config.js';
import { errorResponse } from './core/helpers/apiResponse.js';
import limiter from '../config/rateLimit.config.js';
import router from './route/index.js';
import { info } from '../helpers/logger.js';
import { startDBListener } from './database/dbListener.js';

import deepTrim from './core/middleware/deepTrimming.js';
const __dirname = new URL('.', import.meta.url).pathname;

import { APP_PORT, APP_ENV, APP_URL, APP_TIMEZONE } from '../config/config.js';

//import './sentry-init.js';

const app = express();
app.use(useragent.express());

info('🛠️   Bootstrapping Application');

let errorCount = 0;

const hbs = engine({
  partialsDir: 'resources/views/layouts/partials',
  layoutsDir: 'resources/views/layouts/',
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    getCurrentDate: () => moment().tz(APP_TIMEZONE).toDate(),
    getFullName: (firstName, lastName) => `${firstName} ${lastName}`,
    getDate: (date) => moment(date).tz(APP_TIMEZONE).toDate(),
    encodeURI: (url) => encodeURI(url),
    decodeURI: (url) => decodeURI(url),
    emailHTML: (email) => `<a href="mail:${email}">${email}</a>`,
    phoneHTML: (ext, phone) => `<a href="phone:${phone}">${ext} ${phone}</a>`,
  },
});

const corsOptions = {
  credentials: true,
  allowedHeaders: '*',
  origin: '*',
};
app.use(cors(corsOptions));

//Basic rate-limiting middleware for Express.
app.use(limiter);

// Body parsing Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(express.static('public'));

app.engine('handlebars', hbs);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'resources/views'));

//Deep trim middleware
app.use(deepTrim.handle);

// i18n
app.use(i18n);

//Helmet helps you secure your Express apps by setting various HTTP headers.
app.use(helmet());

// Start DB listener in background
startDBListener();

info(`👉  Mode: ${APP_ENV}`);
info(`👉  Port: ${APP_PORT}`);

//don't show the log when it is test
if (APP_ENV === 'development') {
  app.use(logger('combined', { stream: new LoggerStream() }));
}

info('🧭  Mapping Routes');

app.get('/', async (req, res) => {
  return res.status(200).send({
    error: false,
    code: 200,
    message: `Your snodejs-es6 application is running! \n Endpoints available at ${APP_URL}`,
    indicate: 'OK',
  });
});

app.get('/health', async (req, res) => {
  console.log('Health checked on ', new Date());
  return res.status(200).send({
    error: false,
    code: 200,
    message: 'Your snodejs-es6 application is running!',
    indicate: 'OK',
  });
});

//Route Prefixes
app.use('/', router);

//Sentry.setupExpressErrorHandler(app);
app.use(function (err, req, res, next) {
  let showErrorNumber = '';
  const code = err?.code || err?.statusCode;
  let errorMessage = err.toString();

  if (code == 500) {
    errorCount++;
    errorMessage = 'Internal Server error. Please try after sometime.';
    showErrorNumber = `No.- ${errorCount}`;
  }

  if (APP_ENV !== 'test')
    winston.error(
      `${showErrorNumber} - ${code || 500} - ${errorMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );

  return res.status(code || 500).json(errorResponse(err, code || 500));
});

export default app;
