'use strict';
import {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SMTP_SECURE,
  EMAIL_USERNAME,
  EMAIL_PASSWORD,
  DEFAULT_EMAIL,
  DEFAULT_SUBJECT,
} from './config.js';

import path from 'path';
import { URL } from 'url';
const __dirname = new URL('.', import.meta.url).pathname;

export const config = {
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  //secure: EMAIL_SMTP_SECURE, // lack of ssl commented this. You can uncomment it.
  auth: {
    user: EMAIL_USERNAME,
    pass: EMAIL_PASSWORD,
  },
};

export const defaultMail = {
  from: DEFAULT_EMAIL,
  subject: DEFAULT_SUBJECT,
  to: DEFAULT_EMAIL,
  subject: 'Usha Digital',
  template: 'index',
  attachments: [
    { filename: 'abc.jpg', path: path.resolve(__dirname, './image/abc.jpg') },
  ],
};
