const express= require("express");
const router= express.Router();
const catchAsync= require("../utils/catchAsync.js");
const adminController= require("../controllers/adminController.js")

router.route('/get-all-employees')
    .get(catchAsync(adminController.fetchAllEmployees));

router.route('/get-all-drivers')
    .get(catchAsync(adminController.fetchAllDrivers));

module.exports= router;