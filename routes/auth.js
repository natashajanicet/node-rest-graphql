const express = require('express');

const User = require('../models/user');
const authController = require('../controllers/auth');

const { body } = require('express-validator');

const router = express.Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter valid email')
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
            console.log('userDoc', userDoc)
          if (userDoc) {
            return Promise.reject(
              'Email exist already, please pick up a different one.'
            );
          }
        });
      }),
    body('password')
      .trim()
      .isLength({ min: 5}),
    body('name')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.signup
);

module.exports = router;
