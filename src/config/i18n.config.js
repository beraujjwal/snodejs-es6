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
  register: global,
});

export default async function (req, res, next) {
  const headres = req.headers;
  i18n.init(req, res);
  const lang = headres['accept-language'] || 'en';
  i18n.setLocale(lang);
  return next();
}
