const expect = require('chai').expect;
const sinon = require('sinon');

const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller', function () {
  it('should throw error with code 500 if database access fails', function (done) {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@email.com',
        password: 'password',
      },
    };
    AuthController.login(req, {}, () => {})
      .then((result) => {
        console.log(result);
        expect(result).to.be.an('error');
        expect(result).to.have.property('statusCode', 500);
        done();
      })
      User.findOne.restore();
  });
});
