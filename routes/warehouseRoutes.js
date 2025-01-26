const express= require("express");
const router= express.Router();
const catchAsync= require("../utils/catchAsync.js");
const warehouseController= require("../controllers/warehouseController.js");
const {authenticateToken}= require("../middleware/auth.js");

router.route('/get-all')
    .get(catchAsync(warehouseController.fetchAllWarehouse))

module.exports= router;