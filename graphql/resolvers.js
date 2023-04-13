const bycrypt = require('bcryptjs');
const { default: validator } = require('validator');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

module.exports = {
  createUser: async function ({ userInput }, req) {
    const email = userInput.email;
    const password = userInput.password;
    const name = userInput.name;

    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push('Email is invalid');
    }

    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push('Password too short');
    }

    if (errors.length) {
      const error = new Error('Invalid input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('User exist already');
      throw error;
    }

    const hashedPw = await bycrypt.hash(password, 12);
    const user = new User({
      email,
      name,
      password: hashedPw,
    });
    const createdUser = await user.save();

    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async function ({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found');
      error.code = 401;
      throw error;
    }

    const isEqual = await bycrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Incorrect password');
      error.code = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
      },
      'somesupersecretsecret',
      { expiresIn: '1h' }
    );

    return { userId: user._id.toString(), token };
  },
};
