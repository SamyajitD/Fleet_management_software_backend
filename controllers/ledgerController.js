const puppeteer = require('puppeteer');
const Ledger = require("../models/ledgerSchema.js");
const Item = require("../models/itemSchema.js");
const generateLedger = require("../utils/ledgerPdfFormat.js");
const { all } = require('../routes/parcelRoutes.js');

module.exports.newLedger = async(req, res) => {

    try {
        const scannedIds = req.body.codes;
        let items = [];

        for (let id of scannedIds) {
            const item = await Item.findOne({ itemId: id });
            if (!item) continue;
            items.push(item._id);
        }

        const newLedger = new Ledger({
            vehicleNo: req.body.vehicleNo,
            charges: 1000,
            dispatchedAt: new Date(),
            items
        });

        await newLedger.save();
        return res.status(200).json({ message: "Successfully created ledger entry", ledger: newLedger });
    } catch (err) {
        res.status(500).json({ message: "Failed to create a new driver", err });
    }
};

module.exports.generatePDF = async(req, res) => {
    try {
        const { id } = req.params;
        const ledger = await Ledger.findById(id).populate({
            path: 'items',
            populate: {
                path: 'parcelId',
                populate: {
                    path: 'sender'
                }
            }
        });
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const htmlContent = generateLedger(ledger);
        await page.setContent(htmlContent, { waitUntil: 'load' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${id}.pdf"`);
        res.end(pdfBuffer);
    } catch (err) {
        return res.status(500).json({ message: "Failed to generate Ledger PDF", error: err.message });
    }
}

module.exports.allLedger = async(req, res) => {
    try {
        const allVehicleNo = await Ledger.find({
                isComplete: req.body.status !== undefined ? req.body.status : { $in: [true, false] }
            },
            'vehicleNo');
        if (allVehicleNo) {
            return res.status(200).send(allVehicleNo);
        } else {
            return res.json("No Vehicle number found");
        }
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch vehicle numbers", err });
    }
}

module.exports.trackLedger = async(req, res) => {
    try {
        const { id } = req.params;
        const ledger = await Ledger.findOne({ vehicleNo: id, isComplete: false }).populate('items');

        if (!ledger) {
            res.json({ message: `Can't find any Ledger with Vehicle No. ${id}` });
        }

        // res.status(200).json({ message: "Successfully fetched your Ledger", ledger });
        return res.status(200).json({ message: "Successfully fetched your Ledger", ledger });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while tracking your Ledger", error: err.message });
    }
}