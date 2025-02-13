const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync.js");
const parcelController = require("../controllers/parcelController.js");
const { authenticateToken } = require("../middleware/auth.js");

router.route('/new')
    .post(authenticateToken, catchAsync(parcelController.newParcel));

router.route('/track/:id')
    .get(catchAsync(parcelController.trackParcel));

router.route('/generate-qr/:id')
    .get(catchAsync(parcelController.generateQRCodes))

router.route('/all')
    .post(authenticateToken, catchAsync(parcelController.allParcel));

router.route('/generate-lr-receipt/:id')
    .get(catchAsync(parcelController.generateLR))

// router.route('/append/:id')
//     .put(catchAsync(parcelController.appendItemsToParcel))
    
// router.route('/delete/:id')
//     .delete(catchAsync(parcelController.DeleteItemsFromParcel))

router.route('/edit/:id')
        .put(authenticateToken,catchAsync(parcelController.editParcel))



module.exports = router;