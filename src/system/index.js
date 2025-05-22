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
//import * as Sentry from '@sentry/node';

import i18n from '../config/i18n.config.js';
import winston, { LoggerStream } from '../config/winston.config.js';
import { errorResponse } from './helpers/apiResponse.js';
import limiter from '../config/rateLimit.config.js';
import router from './route/index.js';

import deepTrim from './core/middleware/deepTrimming.js';
// import { consumerKafkaMessage } from '../libraries/consumer.library.js';
// import { sendKafkaNotification } from '../libraries/producer.library.js';
const __dirname = new URL('.', import.meta.url).pathname;

import { APP_TIMEZONE } from '../config/config.js';

//import './sentry-init.js';

const app = express();
app.use(useragent.express());

console.log('🔧  Bootstrapping Application');

let apiHitCount = 0;
let errorCount = 0;

const hbs = engine({
  partialsDir: 'resources/views/layouts/partials',
  layoutsDir: 'resources/views/layouts/',
  defaultLayout: 'main',
  extname: '.hbs',
  helpers: {
    getCurrentDate: () => moment().tz(APP_TIMEZONE).toDate(),
    getFullName(firstName, lastName) {
      return `${firstName} ${lastName}`;
    },
    getDate: (date) => {
      return moment(date).tz(APP_TIMEZONE).toDate();
    },
  },
});

const corsOptions = {
  credentials: true,
  allowedHeaders: '*',
  origin: '*',
};
app.use(cors(corsOptions));

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

//Basic rate-limiting middleware for Express.
app.use(limiter);

//Helmet helps you secure your Express apps by setting various HTTP headers.
app.use(helmet());

const PORT = +process.env.APP_PORT || 3000;
const MODE = process.env.APP_ENV || 'development';

console.log(`👉  Mode: ${MODE}`);
console.log(`👉  Port: ${PORT}`);

//don't show the log when it is test
if (MODE === 'development') {
  app.use(logger('dev', { stream: new LoggerStream() }));
}

console.log('👉  Mapping Routes');

app.get('/', async (req, res) => {
  return res.status(200).send({
    message: `Welcome to the snodejs API! \n Endpoints available at http://localhost:${PORT}`,
  });
});

app.get('/health', async (req, res) => {
  return res.status(200).send({
    message: `Welcome to the admin service.`,
  });
});

//Route Prefixes
app.use('/', router);

// Kafka Consumer
// consumerKafkaMessage();

//sendKafkaNotification('dummy-topic', { message: `Here i am at ${new Date().toISOString()}.` });

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

  if (MODE !== 'test')
    winston.error(
      `${showErrorNumber} - ${code || 500} - ${errorMessage} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );

  return res.status(code || 500).json(errorResponse(err, code || 500));
});

export default app;
