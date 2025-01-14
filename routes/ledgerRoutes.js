const express = require("express");
const catchAsync = require("../utils/catchAsync.js");
const router = express.Router();
const Ledger = require("../models/ledgerSchema.js")
const ledgerController = require("../controllers/ledgerController.js");

router.route('/new')
    .post(catchAsync(ledgerController.newLedger));

module.exports = router;