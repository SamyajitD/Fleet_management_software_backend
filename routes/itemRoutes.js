const express= require("express");
const router= express.Router();
const catchAsync= require("../utils/catchAsync.js");
const itemController= require("../controllers/itemController.js");

router.route('/get-details/:id')
    .get(catchAsync(itemController.getItemDetails));

module.exports= router;