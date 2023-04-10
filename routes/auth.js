const express = require('express');

const authController = require('../controllers/auth');

const router = express.Router();

router.put('/singup', authController.signup);

module.exports = router;