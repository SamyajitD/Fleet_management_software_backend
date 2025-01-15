const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync.js");
const parcelController = require("../controllers/parcelController.js");
const { isLoggedIn, isAdmin } = require("../middleware.js");

router.route('/new')
    .post(catchAsync(parcelController.newParcel));

router.route('/track/:id')
    .get(catchAsync(parcelController.trackParcel));

router.route('/generate-qr/:id')
    .get(catchAsync(parcelController.generateQRCodes))

router.route('/all-parcel-no')
    .get(catchAsync(parcelController.allParcelNo));

router.route('/generate-lr-receipt/:id')
    .get(catchAsync(parcelController.generateLR))

module.exports = router;