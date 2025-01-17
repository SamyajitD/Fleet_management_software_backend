const puppeteer = require('puppeteer');
const Ledger = require("../models/ledgerSchema.js");
const Item = require("../models/itemSchema.js");
const generateLedger = require("../utils/ledgerPdfFormat.js");
const generateLedgerReport= require("../utils/ledgerReportFormat.js");
const formatToIST= require("../utils/dateFormatter.js");

module.exports.newLedger = async (req, res) => {
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
        return res.status(200).json({ message: "Successfully created ledger entry", body: newLedger });
    } catch (err) {
        return res.status(500).json({ message: "Failed to create a new driver", err });
    }
};

module.exports.generatePDF = async (req, res) => {
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

module.exports.allLedger = async (req, res) => {
    try {
        const allVehicleNo = await Ledger.find({
            isComplete: req.body.status !== undefined ? req.body.status : { $in: [true, false] }
        },
            'vehicleNo');
        if (allVehicleNo) {
            return res.status(200).json({ message: "Successfull", body: allVehicleNo });
        } else {
            return res.status(201).json({ message: "No Vehicle number found", body: [] });
        }
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch vehicle numbers", err });
    }
}

module.exports.trackLedger = async (req, res) => {
    try {
        const { id } = req.params;
        const ledger = await Ledger.findOne({ vehicleNo: id, isComplete: false }).populate('items');

        if (!ledger) {
            return res.status(201).json({ message: `Can't find any Ledger with Vehicle No. ${id}`, body: {} });
        }

        return res.status(200).json({ message: "Successfully fetched your Ledger", body: ledger });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while tracking your Ledger", error: err.message });
    }
}

module.exports.generateReport= async(req, res)=>{
    try{
        const {dateRange}= req.params;

        if (!dateRange || dateRange.length !== 16) {
            return res.status(201).json({ message: "Invalid date range format" });
        }

        const startString= dateRange.slice(0, 8);
        const endString= dateRange.slice(8);

        const convertDate = (dateString) => {
            const day = parseInt(dateString.slice(0, 2), 10);
            const month = parseInt(dateString.slice(2, 4), 10);
            const year = parseInt(dateString.slice(4), 10);

            if (
                isNaN(day) || isNaN(month) || isNaN(year) ||
                day < 1 || day > 31 ||
                month < 1 || month > 12 ||
                year < 2000 || year > 2125
            ) {
                throw new Error(`Invalid date: ${dateString}`);
            }

            const date = new Date(year, month - 1, day);
            if (date.getDate() !== day || date.getMonth() + 1 !== month || date.getFullYear() !== year) {
                throw new Error(`Invalid date: ${dateString}`);
            }

            return date;
        };

        let startDate = convertDate(startString);
        let endDate = convertDate(endString);
        endDate.setHours(23, 59, 59, 999);

        const allLedgers= await Ledger.find({dispatchedAt: {$gte: startDate, $lte: endDate}});

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const htmlContent = generateLedgerReport(allLedgers, startDate, endDate);
        await page.setContent(htmlContent, { waitUntil: 'load' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Ledger Report - ${formatToIST(startDate).replace(/ at.*$/, '')} to ${formatToIST(endDate).replace(/ at.*$/, '')}.pdf"`);

        return res.end(pdfBuffer);
    }catch(err){
        return res.status(500).json({message: "Failed to generate ledger report", error: err.message});
    }
}