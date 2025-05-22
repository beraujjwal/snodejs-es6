'use strict';
import 'dotenv/config';
//During the automated test the env variable, We will set it to "test"
process.env.APP_PORT = '5335';
process.env.APP_ENV = 'test';

//Require the dev-dependencies
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../system/index.js';
let should = chai.should();
chai.use(chaiHttp);

//Export this to use in multiple files
module.exports = {
  chai: chai,
  server: server,
  should: should,
};
