import * as Sentry from '@sentry/node';
//import * as Tracing from '@sentry/tracing';
import express from 'express'; // required by Sentry instrumentation

import { SENTRY_DSN } from '../config/config.js';

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    // Tracing integration
    new Sentry.Integrations.Express({ app: express() }),
    //new Tracing.Integrations.Http({ tracing: true }),
  ],
  tracesSampleRate: 1.0,
});
