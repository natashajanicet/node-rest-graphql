const expect = require('chai').expect;
const sinon = require('sinon');

const User = require('../models/user');
const AuthController = require('../controllers/auth');
const { default: mongoose } = require('mongoose');

describe('Auth Controller', function () {
  before(function (done) {
    mongoose
      .connect(
        'mongodb://0.0.0.0:27017/messages-testing?retryWrites=true&w=majority'
      )
      .then((result) => {
        const user = new User({
          email: 'test@test.com',
          password: '12345',
          name: 'Test',
          posts: [],
          _id: '64365bc9d9f02080a3df6bc9',
        });
        return user.save();
      })
      .then(() => {
        done();
      })
      .catch((err) => console.log(err));
  });

  beforeEach(function() {});
  afterEach(function() {});
  
  it('should throw error with code 500 if database access fails', function (done) {
    sinon.stub(User, 'findOne');
    User.findOne.throws();

    const req = {
      body: {
        email: 'test@email.com',
        password: 'password',
      },
    };
    AuthController.login(req, {}, () => {}).then((result) => {
      console.log(result);
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);
      done();
    });
    User.findOne.restore();
  });

  it('should send a response with a valid user status for an existing user', function (done) {
    const req = { userId: '64365bc9d9f02080a3df6bc9' };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.userStatus = data.status;
      },
    };
    AuthController.getUserStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.be.equal(200);
      expect(res.userStatus).to.be.equal('I am new');
      done();
    });
  });

  after(function (done) {
    User.deleteMany({})
      .then(() => {
        return mongoose.disconnect();
      })
      .then(() => {
        done();
      });
  });
});
