'use strict';
import 'dotenv/config';
import { chai, server, should } from './testConfig.js';
import db from '../system/core/model/index.js';

import { log, error, info } from'../system/core/helpers/errorLogs.js';
/**
 * Test cases to test all the authentication APIs
 * Covered Routes:
 * (1) Login
 * (2) Register
 * (3) Verify user
 */

const userModel = db.User;
const tokenModel = db.Token;

describe('User', () => {
  // Before each test we should store some required
  before((done) => {
    userModel.deleteMany({}, (err) => {
      if (err) error(err);
      tokenModel.deleteMany({});
      done();
    });
  });

  // Prepare data for testing
  const testData = {
    name: 'John Doe',
    email: 'john.doe@mail.com',
    phone: '9874563210',
    password: '123456',
    roles: ['subscriber'],
  };

  const rootUserData = {
    name: 'Anna Jones',
    email: 'anna.jones@mail.com',
    phone: '9874563211',
    password: '123456',
    roles: ['administrator'],
  };
  var newTestData, newRootUserData;
  const createdID = [];


  describe('1) /POST Register user only with email', () => {
    it('It should send validation error for Register', (done) => {
      chai
        .request(server)
        .post('/api/v1.0/auth/signup')
        .send({ email: testData.email })
        .end((err, res) => {
          if (err) error(err);
          res.should.have.status(200);
          res.body.should.have.property('error').eql(true);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe('2) /POST Register user with required data', () => {
    it('It should Register user', (done) => {
      chai
        .request(server)
        .post('/api/v1.0/auth/signup')
        .send(testData)
        .end((err, res) => {
          if (err) error(err);
          res.should.have.status(200);
          res.body.should.have.property('error').eql(false);
          newTestData = res.body.data;
          createdID.push(newTestData.token.user);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe('3) /POST Login user before verify', () => {
    it('it should Send account not verified.', (done) => {
      chai
        .request(server)
        .post('/api/v1.0/auth/signin')
        .send({ username: testData.email, password: testData.password })
        .end((err, res) => {
          if (err) error(err);
          res.should.have.status(200);
          res.body.should.have.property('error').eql(true);
          done();
        });
    });
  });

  /*
   * Test the /GET route
   */
  describe('4) /GET verified by url', () => {
    it('It should verified', (done) => {
      chai
        .request(server)
        .get(
          `/auth/verify/${newTestData.token.user}/${newTestData.token.token}`,
        )
        .end((err, res) => {
          if (err) error(err);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe('5) /POST Login user only with email', () => {
    it('It should send validation error for Login', (done) => {
      chai
        .request(server)
        .post('/api/v1.0/auth/signin')
        .send({ username: testData.email })
        .end((err, res) => {
          if (err) error(err);
          res.should.have.status(200);
          res.body.should.have.property('error').eql(true);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe('6) /POST Login user only with phone', () => {
    it('It should send validation error for Login', (done) => {
      chai
        .request(server)
        .post('/api/v1.0/auth/signin')
        .send({ username: testData.phone })
        .end((err, res) => {
          if (err) error(err);
          res.should.have.status(200);
          res.body.should.have.property('error').eql(true);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe('7) /POST Login user with wrong username & password', () => {
    it('it should Send failed user Login', (done) => {
      chai
        .request(server)
        .post('/api/v1.0/auth/signin')
        .send({ username: 'admin@admin.com', password: '1234' })
        .end((err, res) => {
          if (err) error(err);
          res.should.have.status(200);
          res.body.should.have.property('error').eql(true);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe('8) /POST Login user with wrong password', () => {
    it('it should Send failed user Login', (done) => {
      chai
        .request(server)
        .post('/api/v1.0/auth/signin')
        .send({ username: testData.email, password: '1234' })
        .end((err, res) => {
          if (err) error(err);
          res.should.have.status(200);
          res.body.should.have.property('error').eql(true);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe('9) /POST Login user with correct email & password', () => {
    it('it should do user Login', (done) => {
      chai
        .request(server)
        .post('/api/v1.0/auth/signin')
        .send({ username: testData.email, password: testData.password })
        .end((err, res) => {
          if (err) error(err);
          res.should.have.status(200);
          res.body.should.have.property('error').eql(false);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe('10) /GET Login user with correct email & password', () => {
    it('it should do user Login', (done) => {
      chai
        .request(server)
        .post('/api/v1.0/auth/signin')
        .send({ username: testData.email, password: testData.password })
        .end((err, res) => {
          if (err) error(err);
          res.should.have.status(200);
          res.body.should.have.property('error').eql(false);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe('11) /POST Login user with correct phone & password', () => {
    it('it should do user Login', (done) => {
      chai
        .request(server)
        .post('/api/v1.0/auth/signin')
        .send({ username: testData.phone, password: testData.password })
        .end((err, res) => {
          if (err) error(err);
          res.should.have.status(200);
          res.body.should.have.property('error').eql(false);
          done();
        });
    });
  });

  /*
   * Test the /POST route
   */
  describe('12) /POST Register user with root access', () => {
    it('It should Register user', (done) => {
      chai
        .request(server)
        .post('/api/v1.0/auth/signup')
        .send(rootUserData)
        .end((err, res) => {
          if (err) error(err);
          res.should.have.status(200);
          res.body.should.have.property('error').eql(false);
          newRootUserData = res.body.data;
          done();
        });
    });
  });

  /*
   * Test the /GET route
   */
  describe('13) /GET root user verified by url', () => {
    it('It should verified', (done) => {
      chai
        .request(server)
        .get(
          `/auth/verify/${newRootUserData.token.user}/${newRootUserData.token.token}`,
        )
        .end((err, res) => {
          if (err) error(err);
          done();
        });
    });
  });

  after((done) => {
    createdID.forEach((id) => {
      userModel.findByIdAndRemove(id, (err) => {
        if (err) error(err);
      });
    });
    done();
  });
});
