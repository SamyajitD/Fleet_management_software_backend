const express= require("express");
const router= express.Router();
const catchAsync= require("../utils/catchAsync.js");
const itemController= require("../controllers/itemController.js");

router.route('/get-details/:id')
    .get(catchAsync(itemController.getItemDetails));

router.route('/generate-qr/:id')
    .get(catchAsync(itemController.generateQR))

module.exports= router;