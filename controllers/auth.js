const { validationResult } = require('express-validator');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  try {
    const hashedPassword = await bycrypt.hash(password, 12);
    const user = new User({
      email,
      name,
      password: hashedPassword,
    });
    const result = await user.save();
    res.status(201).json({ message: 'User created!', userId: result._id });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const loadedUser = await User.findOne({ email: email });
    if (!loadedUser) {
      const error = new Error('A user with this email could not be found');
      error.statusCode = 401;
      throw error;
    }

    const isEqual = await bycrypt.compare(password, loadedUser.password);
    if (!isEqual) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email,
        userId: loadedUser._id.toString(),
      },
      'supersecretsecret',
      {
        expiresIn: '1h',
      }
    );

    res.status(200).json({ token, userId: loadedUser._id.toString() });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 401;
      throw error;
    }

    res.status(200).json({ message: 'Status fetched!', status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error();
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const status = req.body.status;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('Invalid user');
      error.statusCode = 401;
      throw error;
    }

    user.status = status;
    await user.save();
    res.status(200).json({ message: 'Status updated!' });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
