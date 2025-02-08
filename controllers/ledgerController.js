const puppeteer = require('puppeteer');
const Ledger = require("../models/ledgerSchema.js");
const Item = require("../models/itemSchema.js");
const generateUniqueId = require("../utils/uniqueIdGenerator.js");
const generateLedger = require("../utils/ledgerPdfFormat.js");
const generateLedgerReport = require("../utils/ledgerReportFormat.js");
const formatToIST = require("../utils/dateFormatter.js");
const ExcelJS = require('exceljs');
const {updateParcelStatus} = require('../utils/updateParcelStatus.js');
const Employee= require("../models/employeeSchema.js");
const Warehouse= require("../models/warehouseSchema.js");

module.exports.newLedger = async(req, res) => {
    try {
        const scannedIds = req.body.codes;

        let items = [];

        const newLedger = new Ledger({
            ledgerId: generateUniqueId(14),
            vehicleNo: req.body.vehicleNo,
            charges: 1000, 
            dispatchedAt: new Date(),
            scannedBy: req.user._id,   
            sourceWarehouse: req.user.warehouseCode,
            status: 'pending',
            items: []
        });

        for (let id of scannedIds) {
            const item = await Item.findOne({ itemId: id });
            if (!item) continue;
            item.status = 'pending';
            item.ledgerId = newLedger._id;
            await item.save();
   
            newLedger.items.push({
                itemId: item._id,
                hamali:  15,
                freight:  50
            });
            await updateParcelStatus(item.parcelId);
        }

        await newLedger.save();
        res.status(200).json({message: "Ledger created successfully", body: newLedger});
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
        const allLedger = await Ledger.find().populate('items.itemId scannedBy verifiedBy scannedByDest verifiedByDest');
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
            .populate('items.itemId scannedBy verifiedBy scannedByDest verifiedByDest');

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

            const browser = await puppeteer.launch({
                headless: true,
                userDataDir: '/opt/render/.cache/puppeteer'
            });
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
            }).populate('items.itemId scannedBy verifiedBy scannedByDest verifiedByDest sourceWarehouse destinationWarehouse');
        } else {
            ledgers = await Ledger.find({
                dispatchedAt: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).populate('items.itemId scannedBy verifiedBy scannedByDest verifiedByDest sourceWarehouse destinationWarehouse');
        }

        return res.status(200).json({ message: "Successful", body: ledgers });
    } catch (err) {
        return res.status(500).json({ message: "Failed to get ledgers by date", error: err.message });
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
            }).populate('items.itemId scannedBy verifiedBy');
        } else {
            allLedgers = await Ledger.find({ dispatchedAt: { $gte: startDate, $lte: endDate } }).populate('items.itemId').populate('scannedBy').populate('verifiedBy');
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Ledger Report');

        worksheet.columns = [
            { header: 'Vehicle No', key: 'vehicleNo', width: 15 },
            { header: 'Charges', key: 'charges', width: 15 },
            { header: 'Is Complete', key: 'status', width: 15 },
            { header: 'Dispatched At', key: 'dispatchedAt', width: 20 },
            { header: 'Delivered At', key: 'deliveredAt', width: 20 },
            { header: 'Item Count', key: 'items', width: 30 },
            { header: 'Total Hamali', key: 'hamali', width: 15 },
            { header: 'Scanned By', key: 'scannedBy', width: 20 },
            { header: 'Verified By', key: 'verifiedBy', width: 20 },
            { header: 'Destination Warehouse', key: 'destinationWarehouse', width: 20 },
            { header: 'Source Warehouse', key: 'sourceWarehouse', width: 20 },
        ];

        allLedgers.forEach(ledger => {
            const totalHamali = ledger.items.reduce((sum, item) => sum + (item.hamali || 0), 0);

            worksheet.addRow({
                vehicleNo: ledger.vehicleNo,
                charges: ledger.charges,
                status: ledger.status,
                dispatchedAt: ledger.dispatchedAt,
                deliveredAt: ledger.deliveredAt,
                items: ledger.items.length,
                hamali: totalHamali,  // Sum of hamali for all items in this ledger
                scannedBy: ledger.scannedBy?.name || '',
                verifiedBy: ledger.verifiedBy?.name || '',
                destinationWarehouse: ledger.destinationWarehouse,
                sourceWarehouse: ledger.sourceWarehouse,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Ledger Report ${isForVehicle ? `(${vehicleNo})` : ''} - ${formatToIST(startDate).replace(/ at.*$/, '')} to ${formatToIST(endDate).replace(/ at.*$/, '')}.xlsx"`);

        await workbook.xlsx.write(res);
        return res.end();
    } catch (err) {
        return res.status(500).json({ message: "Failed to generate ledger report", error: err.message });
    }
}

module.exports.editLedger = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Ledger ID is required' });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Update data is required' });
        }

        let ledger = await Ledger.findOne({ ledgerId: id });
        if (!ledger) {
            return res.status(404).json({ message: `Can't find any Ledger with ID ${id}` });
        }

        if (updateData.items) {
            updateData.items = updateData.items.map(item => ({
                itemId: item.itemId,
                hamali: item.hamali
            }));
        }

        const fieldsToUpdate = {};
        for (const key in updateData) {
            if (updateData.hasOwnProperty(key)) {
                fieldsToUpdate[key] = updateData[key];
            }
        }

        const updatedLedger = await Ledger.findByIdAndUpdate(
            ledger._id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true }
        ).populate('items.itemId scannedBy verifiedBy');

        if(fieldsToUpdate.items.itemId){
            for (const item of fieldsToUpdate.items.itemId) {
                await updateParcelStatus(item.parcelId);
            }
        }

        return res.status(200).json({ message: "Ledger updated successfully", body: updatedLedger });
    } catch (err) {
        return res.status(500).json({ message: "Failed to update ledger", error: err.message });
    }
};

module.exports.deliverLedger = async(req, res) => {
    try {
        const { id } = req.params;
        const { data } = req.body;

        let ledgers=await Ledger.findOne({ledgerId:id});
        let parcelIds=[];
        for(let item of body.items){
            
            let itemDetails=await Item.findById(item.itemId);
            itemDetails.status='delivered';
            await itemDetails.save();
            if(!parcelIds.contains(itemDetails.parcelId))
                parcelIds.push(itemDetails.parcelId);
        }

        ledgers.status='delivered';
        for(const pId of parcelIds)
            updateParcelStatus(pId);
        ledgers.deliveredAt=new Date();
        ledgers.verifiedByDest=data.verifiedByDest;
        await ledgers.save();

        return res.status(200).json({ message: "Successful", body: ledgers });
    } catch (err) {
        return res.status(500).json({ message: "Failed to get ledgers by date", error: err.message });
    }
}

module.exports.deliverItem = async(req, res) => {
    try {
        // const { id } = req.params;
        const { data } = req.body;

        // let ledgers=await Ledger.findOne({ledgerId:id});
        let parcelIds=[];
        for(let item of data.items){
            
            let itemDetails=await Item.findById(item.itemId);
            itemDetails.status='delivered';
            await itemDetails.save();
            if(!parcelIds.contains(itemDetails.parcelId))
                parcelIds.push(itemDetails.parcelId);
        }

        // ledgers.status='delivered';
        for(const pId of parcelIds)
            updateParcelStatus(pId);
        // ledgers.deliveredAt=new Date();
        // ledgers.verifiedByDest=data.verifiedByDest;
        // await ledgers.save();

        return res.status(200).json({ message: "Successful", flag : true });
    } catch (err) {
        return res.status(500).json({ message: "Failed to get ledgers by date", error: err.message });
    }
}



