const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

const User = require('../models/user');
const FeedController = require('../controllers/feed');

describe('Feed Controller', function () {
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
  
  it('should add a created post to the posts of the user', function (done) {
    const req = {
      body: {
        title: 'test@email.com',
        content: 'password',
      },
      file: {
        path: 'abc'
      },
      userId: '64365bc9d9f02080a3df6bc9'
    };
    const res = { status: function() { return this; }, json: () => {}};

    FeedController.createPost(req, res, () => {})
        .then(savedUser => {
            expect(savedUser).to.have.property('posts');
            expect(savedUser.posts).to.have.length(1);
            done();
        })
        .catch(err => {
            done();
        })
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
