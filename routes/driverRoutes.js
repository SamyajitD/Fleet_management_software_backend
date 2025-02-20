const express = require("express");
const catchAsync = require("../utils/catchAsync.js");
const router = express.Router();
const driverController = require("../controllers/driverController.js");
const { authenticateToken } = require('../middleware/auth');

router.route('/all-truck-no')
    .get(authenticateToken, catchAsync(driverController.allTruckNo));

module.exports = router;