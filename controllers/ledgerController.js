const puppeteer = require('puppeteer');
const Ledger = require("../models/ledgerSchema.js");
const Item = require("../models/itemSchema.js");
const generateUniqueId = require("../utils/uniqueIdGenerator.js");
const generateLedger = require("../utils/ledgerPdfFormat.js");
const generateLedgerReport = require("../utils/ledgerReportFormat.js");
const formatToIST = require("../utils/dateFormatter.js");
const ExcelJS = require('exceljs');

module.exports.newLedger = async(req, res) => {
    try {
        const scannedIds = req.body.codes;
        const scannedBy = req.body.scannedBy;
        // const destinationWarehouse = req.body.destinationWarehouse;
        // const sourceWarehouse = req.body.sourceWarehouse;

        let items = [];

        for (let id of scannedIds) {
            const item = await Item.findOne({ itemId: id });
            if (!item) continue;
            items.push({
                itemId: item.itemId,
                // hamali: req.body.hamali || 0 // Assuming hamali is provided in the request body
            });
        }

        const newLedger = new Ledger({
            ledgerId: generateUniqueId(14),
            vehicleNo: req.body.vehicleNo,
            charges: 1000, // Default charges if not provided
            // dispatchedAt: new Date(),
            // deliveredAt: req.body.deliveredAt || null,
            items,
            scannedBy,
            // verifiedBy: req.body.verifiedBy || null,
            // destinationWarehouse,
            // sourceWarehouse,
            isComplete: 'pending' // Default value
        });

        await newLedger.save();
        res.status(201).json(newLedger);
    } catch (err) {
        res.status(500).json({ message: "Failed to create new ledger", error: err.message });
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
        const ledger = await Ledger.findOne({ ledgerId: id })
            .populate('items.itemId')
            .populate('scannedBy')
            .populate('verifiedBy');

        if (!ledger) {
            return res.status(201).json({ message: `Can't find any Ledger with ID ${id}`, body: {} });
        }

        return res.status(200).json({ message: "Successful", body: ledger });
    } catch (err) {
        return res.status(500).json({ message: "Failed to track ledger", error: err.message });
    }
};

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
        const { id } = req.query;

        const formattedDate = date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        const startDate = new Date(`${formattedDate}T00:00:00.000Z`);
        const endDate = new Date(`${formattedDate}T23:59:59.999Z`);

        let ledgers;

        if (id) {
            ledgers = await Ledger.find({
                dispatchedAt: {
                    $gte: startDate,
                    $lte: endDate
                },
                scannedBy: id
            }).populate('items.itemId').populate('scannedBy').populate('verifiedBy');
        } else {
            ledgers = await Ledger.find({
                dispatchedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).populate('items.itemId').populate('scannedBy').populate('verifiedBy');
        }

        return res.status(200).json({ message: "Successful", body: ledgers });
    } catch (err) {
        return res.status(500).json({ message: "Failed to get ledgers by date", error: err.message });
    }
}

// module.exports.getLedgersByDate = async(req, res) => {
//     try {
//         const { date } = req.params;
//         const { id }= req.query;


//         const formattedDate = date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
//         // const startDate = new Date(formattedDate);
//         // console.log(date);
//         const startDate = new Date(`${formattedDate}T00:00:00.000Z`);
//         const endDate = new Date(`${formattedDate}T23:59:59.999Z`);

//         let ledgers;

//         if(id){
//             ledgers= await Ledger.find({
//                 dispatchedAt: {
//                     $gte: startDate,
//                     $lte: endDate
//                 },
//                 scannedBy: id
//             });
//         }else{
//             ledgers= await Ledger.find({
//                 dispatchedAt: {
//                     $gte: startDate,
//                     $lte: endDate
//                 }
//             });
//         }

//         // return res.json([startDate, endDate]);

//         if (!ledgers) {
//             return res.status(201).json({
//                 message: `No ledgers found for date ${date}`,
//                 body: []
//             });
//         }

//         return res.status(200).json({
//             message: "Successfully fetched ledgers",
//             body: ledgers
//         });

//     } catch (err) {
//         return res.status(500).json({
//             message: "Failed to fetch ledgers by date",
//             error: err.message
//         });
//     }
// }


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
            }).populate('items.itemId').populate('scannedBy').populate('verifiedBy');
        } else {
            allLedgers = await Ledger.find({ dispatchedAt: { $gte: startDate, $lte: endDate } }).populate('items.itemId').populate('scannedBy').populate('verifiedBy');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Ledger Report');

        worksheet.columns = [
            { header: 'Vehicle No', key: 'vehicleNo', width: 15 },
            { header: 'Charges', key: 'charges', width: 15 },
            { header: 'Is Complete', key: 'isComplete', width: 15 },
            { header: 'Dispatched At', key: 'dispatchedAt', width: 20 },
            { header: 'Delivered At', key: 'deliveredAt', width: 20 },
            { header: 'Items', key: 'items', width: 30 },
            { header: 'Hamali', key: 'hamali', width: 15 },
            { header: 'Scanned By', key: 'scannedBy', width: 20 },
            { header: 'Verified By', key: 'verifiedBy', width: 20 },
            { header: 'Destination Warehouse', key: 'destinationWarehouse', width: 20 },
            { header: 'Source Warehouse', key: 'sourceWarehouse', width: 20 },
        ];

        allLedgers.forEach(ledger => {
            ledger.items.forEach(item => {
                worksheet.addRow({
                    vehicleNo: ledger.vehicleNo,
                    charges: ledger.charges,
                    isComplete: ledger.isComplete,
                    dispatchedAt: ledger.dispatchedAt,
                    deliveredAt: ledger.deliveredAt,
                    items: item.itemId,
                    hamali: item.hamali,
                    scannedBy: ledger.scannedBy ? ledger.scannedBy._id : '',
                    verifiedBy: ledger.verifiedBy ? ledger.verifiedBy._id : '',
                    destinationWarehouse: ledger.destinationWarehouse,
                    sourceWarehouse: ledger.sourceWarehouse,
                });
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