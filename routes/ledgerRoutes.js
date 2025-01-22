const express = require("express");
const catchAsync = require("../utils/catchAsync.js");
const router = express.Router();
const Ledger = require("../models/ledgerSchema.js")
const ledgerController = require("../controllers/ledgerController.js");

router.route('/new')
    .post(catchAsync(ledgerController.newLedger));

router.route('/generate-ledger-receipt/:id')
    .get(catchAsync(ledgerController.generatePDF))

router.route('/all-ledger')
    .get(catchAsync(ledgerController.allLedger));

router.route('/track/:id')
    .get(catchAsync(ledgerController.trackLedger));

router.route('/generate-report/:dateRange')
    .get(catchAsync(ledgerController.generateReport))

router.route('/generate-excel/:dateRange')
    .get(catchAsync(ledgerController.generateExcel))

router.route('/track-by-date/:date')
    .get(catchAsync(ledgerController.getLedgersByDate));

module.exports = router;