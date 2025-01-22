const puppeteer = require('puppeteer');
const Ledger = require("../models/ledgerSchema.js");
const Item = require("../models/itemSchema.js");
const generateLedger = require("../utils/ledgerPdfFormat.js");
const generateLedgerReport = require("../utils/ledgerReportFormat.js");
const formatToIST = require("../utils/dateFormatter.js");
const ExcelJS = require('exceljs');

module.exports.newLedger = async(req, res) => {

    try {
        const scannedIds = req.body.codes;
        const scannedBy = req.body.scannedBy;

        let items = [];

        for (let id of scannedIds) {
            const item = await Item.findOne({ itemId: id });
            if (!item) continue;
            items.push(item.itemId);
        }

        const newLedger = new Ledger({
            vehicleNo: req.body.vehicleNo,
            charges: 1000,
            dispatchedAt: new Date(),
            items,
            scannedBy
        });

        await newLedger.save();
        return res.status(200).json({ message: "Successfully created ledger entry", body: newLedger });
    } catch (err) {
        return res.status(500).json({ message: "Failed to create a new driver", err });
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
        // console.log("All Ledger");
        const allLedger = await Ledger.find();
        if (allLedger.length === 0) {
            return res.status(201).json({ message: "No Vehicle number found", body: [] });
        }
        return res.status(200).json({ message: "Successfull", body: allLedger });
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch vehicle numbers", err });
    }
}

module.exports.trackLedger = async(req, res) => {
    try {
        const { id } = req.params;
        const ledger = await Ledger.findOne({ _id: id, isComplete: false }).populate('items');

        if (!ledger) {
            return res.status(201).json({ message: `Can't find any Ledger with Vehicle No. ${id}`, body: {} });
        }

        return res.status(200).json({ message: "Successfully fetched your Ledger", body: ledger });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while tracking your Ledger", error: err.message });
    }
}

module.exports.generateReport = async(req, res) => {
        try {
            const { dateRange } = req.params;
            const { vehicleNo } = req.query;

            const isForVehicle = vehicleNo !== undefined;

            if (!dateRange || dateRange.length !== 16) {
                return res.status(201).json({ message: "Invalid date range format" });
            }

            const startString = dateRange.slice(0, 8);
            const endString = dateRange.slice(8);

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

            let allLedgers;

            if (isForVehicle) {
                allLedgers = await Ledger.find({
                    $and: [{
                            dispatchedAt: {
                                $gte: startDate,
                                $lte: endDate
                            }
                        },
                        {
                            vehicleNo
                        }
                    ]
                });
            } else {
                allLedgers = await Ledger.find({ dispatchedAt: { $gte: startDate, $lte: endDate } });
            }

            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            const htmlContent = generateLedgerReport(allLedgers, startDate, endDate, isForVehicle);
            await page.setContent(htmlContent, { waitUntil: 'load' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
            });

            await browser.close();

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="Ledger Report ${isForVehicle===true?`(${vehicleNo})`:''} - ${formatToIST(startDate).replace(/ at.*$/, '')} to ${formatToIST(endDate).replace(/ at.*$/, '')}.pdf"`);

        return res.end(pdfBuffer);
    } catch (err) {
        return res.status(500).json({ message: "Failed to generate ledger report", error: err.message });
    }
}

module.exports.getLedgersByDate = async(req, res) => {
    try {
        const { date } = req.params;
        const { id }= req.query;


        const formattedDate = date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        // const startDate = new Date(formattedDate);
        // console.log(date);
        const startDate = new Date(`${formattedDate}T00:00:00.000Z`);
        const endDate = new Date(`${formattedDate}T23:59:59.999Z`);

        let ledgers;

        if(id){
            ledgers= await Ledger.find({
                dispatchedAt: {
                    $gte: startDate,
                    $lte: endDate
                },
                scannedBy: id
            });
        }else{
            ledgers= await Ledger.find({
                dispatchedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            });
        }

        // return res.json([startDate, endDate]);

        if (!ledgers) {
            return res.status(201).json({
                message: `No ledgers found for date ${date}`,
                body: []
            });
        }

        return res.status(200).json({
            message: "Successfully fetched ledgers",
            body: ledgers
        });

    } catch (err) {
        return res.status(500).json({
            message: "Failed to fetch ledgers by date",
            error: err.message
        });
    }
}

module.exports.generateExcel = async(req, res) => {
    try {
        const { dateRange } = req.params;
        const { vehicleNo } = req.query;

        const isForVehicle = vehicleNo !== undefined;

        if (!dateRange || dateRange.length !== 16) {
            return res.status(201).json({ message: "Invalid date range format" });
        }

        const startString = dateRange.slice(0, 8);
        const endString = dateRange.slice(8);

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

        let allLedgers;

        if (isForVehicle) {
            allLedgers = await Ledger.find({
                $and: [
                    {
                        dispatchedAt: {
                            $gte: startDate,
                            $lte: endDate
                        }
                    },
                    {
                        vehicleNo
                    }
                ]
            }).populate('items scannedBy verifiedBy');
        } else {
            allLedgers = await Ledger.find({ dispatchedAt: { $gte: startDate, $lte: endDate } }).populate('items scannedBy verifiedBy');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Ledger Report');

        worksheet.columns = [
            { header: 'Vehicle No', key: 'vehicleNo', width: 15 },
            { header: 'Charges', key: 'charges', width: 15 },
            { header: 'Is Complete', key: 'isComplete', width: 15 },
            { header: 'Dispatched At', key: 'dispatchedAt', width: 20 },
            { header: 'Items', key: 'items', width: 30 },
            { header: 'Scanned By', key: 'scannedBy', width: 20 },
            { header: 'Verified By', key: 'verifiedBy', width: 20 },
        ];

        allLedgers.forEach(ledger => {
            worksheet.addRow({
                vehicleNo: ledger.vehicleNo,
                charges: ledger.charges,
                isComplete: ledger.isComplete,
                dispatchedAt: ledger.dispatchedAt,
                items: ledger.items.map(item => item._id).join(', '),
                scannedBy: ledger.scannedBy ? ledger.scannedBy._id : '',
                verifiedBy: ledger.verifiedBy ? ledger.verifiedBy._id : '',
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Ledger Report ${isForVehicle ? `(${vehicleNo})` : ''} - ${formatToIST(startDate).replace(/ at.*$/, '')} to ${formatToIST(endDate).replace(/ at.*$/, '')}.xlsx"`);

        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        return res.status(500).json({ message: "Failed to generate ledger report", error: err.message });
    }
}