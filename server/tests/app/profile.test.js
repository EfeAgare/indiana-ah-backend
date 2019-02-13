import request from 'supertest';
import { expect } from 'chai';
import app from '../../index';
import assignToken from '../../helpers/assignJwtToken';

import {
  data, mockData, payload, badPayload
} from './mockData/userMockData';

const falseToken = assignToken(payload);
const badToken = assignToken(badPayload);

let firstToken = '';
let secondToken = '';

before(() => {
  const user1 = {
    username: 'cim',
    email: 'cim@gmail.com',
    password: 'baleesecret23'
  };
  return request(app)
    .post('/api/v1/register')
    .send(user1)
    .then((res) => {
      firstToken = res.body.token;
    });
});
describe('user verification', () => {
  it('should verify a user\'s account', () => request(app)
    .patch(`/api/v1/users/verify?token=${firstToken}`)
    .then((res) => {
      secondToken = res.body.token;
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal('User Successfully Verified');
    }));
});

describe('user profile', () => {
  it('should return an error if an invalid username is provided', () => request(app)
    .get('/api/v1/profiles/tiku')
    .set('x-auth-token', secondToken)
    .then((res) => {
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('User not found');
    }));

  it('should return the user\'s profile when a valid username is provided', () => request(app)
    .get('/api/v1/profiles/cim')
    .set('x-auth-token', secondToken)
    .then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.profile).to.be.an('object');
    }));
});

describe('Edit user profile', () => {
  it('should return an error if user is not authenticated', () => request(app)
    .patch('/api/v1/profiles/balee/update')
    .send(data)
    .then((res) => {
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Access denied. You are not authorized to access this route');
    }));
  it('should return updated user profile if user is authenticated and verified', () => request(app)
    .patch('/api/v1/profiles/cim/update')
    .set('x-auth-token', secondToken)
    .send(data)
    .then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.profile).to.be.an('object');
    }));
  it('should return an error when invalid ID passed', () => request(app)
    .patch('/api/v1/profiles/tiku/update')
    .set('x-auth-token', falseToken)
    .send(data)
    .then((res) => {
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('User not found');
    }));
  it('should return an error when invalid username is passed', () => request(app)
    .patch('/api/v1/profiles/king/update')
    .set('x-auth-token', secondToken)
    .send(mockData)
    .then((res) => {
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('User not found');
    }));
});

describe('Edit user picture', () => {
  it('should return an error if user is not authenticated', () => request(app)
    .patch('/api/v1/profiles/image')
    .send(data)
    .then((res) => {
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal('Access denied. You are not authorized to access this route');
    }));
  it('should return updated user picture if user is authenticated and verified', () => request(app)
    .patch('/api/v1/profiles/image')
    .set('x-auth-token', secondToken)
    .field('Content-Type', 'multipart/form-data')
    .attach('image', 'server/tests/testImage/feather.jpg')
    .then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.avatar).to.match(/^http/);
    }));
  it('should return an error when invalid ID passed', () => request(app)
    .patch('/api/v1/profiles/image')
    .set('x-auth-token', falseToken)
    .field('Content-Type', 'multipart/form-data')
    .attach('image', 'server/tests/testImage/feather.jpg')
    .then((res) => {
      expect(res.status).to.equal(404);
      expect(res.body.message).to.equal('User not found');
    }));
  it('should return an error when invalid ID type passed', () => request(app)
    .patch('/api/v1/profiles/image')
    .set('x-auth-token', badToken)
    .field('Content-Type', 'multipart/form-data')
    .attach('image', 'server/tests/testImage/feather.jpg')
    .then((res) => {
      expect(res.status).to.equal(500);
      expect(res.body.message).to.equal('Internal server error');
    }));
});