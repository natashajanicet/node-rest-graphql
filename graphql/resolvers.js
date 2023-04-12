const bycrypt = require('bcryptjs');
const { default: validator } = require("validator");

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

    if (validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
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
};
