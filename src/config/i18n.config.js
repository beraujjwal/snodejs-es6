'use strict';
import 'dotenv/config';
import i18n from 'i18n';
import { URL } from 'url';

const __dirname = new URL('.', import.meta.url).pathname;

i18n.configure({
  // setup some locales
  locales: ['en', 'bn', 'hi'],
  defaultLocale: 'en',
  queryParameter: 'lang',
  // where to store json files
  directory: __dirname + '/../resources/locales',
  /*api: {
        '__': 'translate',
        '__n': 'translateN'
    },*/
  autoReload: true, // Auto reload translations in dev
  updateFiles: false, // Prevent creating missing translation keys
  syncFiles: false,
  objectNotation: true, // Enable nested keys
  register: global,
});

export default function i18nMiddleware(req, res, next) {
  const headres = req.headers;
  i18n.init(req, res);
  const lang = req.query.lang || headres['accept-language'] || 'en';
  //i18n.setLocale(lang);
  // Set locale if it's a valid one
  if (i18n.getLocales().includes(lang)) {
    i18n.setLocale(req, lang);
  } else {
    i18n.setLocale(req, i18n.getLocale());
  }
  return next();
}
