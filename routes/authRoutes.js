const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const Employee = require('../models/employeeSchema');
const { authenticateToken } = require('../middleware/auth');
const catchAsync= require("../utils/catchAsync.js");
const authController= require("../controllers/authController.js");

router.route('/register')
    .post(catchAsync(authController.register));

router.route('/login')
    .post(catchAsync(authController.login));

router.route('/status')
    .get(authenticateToken, catchAsync(authController.getStatus));

router.route('/forgot-password')
    .post(catchAsync(authController.forgotPassword));

module.exports = router;