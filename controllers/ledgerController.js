const puppeteer = require('puppeteer');
const Ledger = require("../models/ledgerSchema.js");
const Item = require("../models/itemSchema.js");
const generateUniqueId = require("../utils/uniqueIdGenerator.js");
const generateLedger = require("../utils/ledgerPdfFormat.js");
const generateLedgerReport = require("../utils/ledgerReportFormat.js");
const formatToIST = require("../utils/dateFormatter.js");
const ExcelJS = require('exceljs');
const Employee= require("../models/employeeSchema.js");
const Warehouse= require("../models/warehouseSchema.js");
const Parcel= require("../models/parcelSchema.js");
const qrCodeGenerator= require("../utils/qrCodeGenerator.js");

module.exports.newLedger = async(req, res) => {
    try {
        const scannedIds = req.body.codes;
        const parcels = [];
        for (const id of scannedIds) {
            let parcel = await Parcel.findOne({ trackingId: id });
            if (parcel) parcels.push(parcel._id);
        }

        /* confirm about checks for admin */
        const newLedger = new Ledger({
            ledgerId: generateUniqueId(14),
            vehicleNo: req.body.vehicleNo,
            status: 'pending',
            dispatchedAt: new Date(),
            parcels,
            scannedBySource: req.user._id,   
            sourceWarehouse: req.user.warehouseCode,
        });

        await newLedger.save();
        for (const id of scannedIds) {
            let parcel = await Parcel.findOne({ trackingId: id });
            if (parcel) {
                parcel.ledgerId = newLedger._id;
                parcel.status = 'dispatched';
            }
            await parcel.save();
        }
        
        res.status(200).json({message: "Ledger created successfully", body: newLedger});
    } catch (err) {
        res.status(500).json({ message: "Failed to create new ledger", error: err.message });
    }
};


module.exports.generatePDF = async(req, res) => {
    try {
        const { id } = req.params;
        const ledger = await Ledger.findOne({ ledgerId: id })
            .populate({
                path: 'parcels',
                populate: [
                    { path: 'items' }, 
                    { path: 'sender' },
                    { path: 'receiver' },
                    { path: 'sourceWarehouse' },
                    { path: 'destinationWarehouse' }
                ]
            })
            .populate({
                path: 'scannedBySource scannedByDest verifiedBySource verifiedByDest',
                select: '-password' 
            })
            .populate('sourceWarehouse destinationWarehouse');

        const browser = await puppeteer.launch({
            executablePath: '/opt/render/.cache/puppeteer/chrome/linux-133.0.6943.53/chrome-linux64/chrome',
            headless: true
        });

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


module.exports.trackLedger = async (req, res) => {
    try {
        const { id } = req.params;
        
        const ledger = await Ledger.findOne({ ledgerId: id })
            .populate({
                path: 'parcels',
                populate: [
                    { path: 'items' }, 
                    { path: 'sender' },
                    { path: 'receiver' },
                    { path: 'sourceWarehouse' },
                    { path: 'destinationWarehouse' }
                ]
            })
            .populate({
                path: 'scannedBySource scannedByDest verifiedBySource verifiedByDest',
                select: '-password' 
            })
            .populate('sourceWarehouse destinationWarehouse');

        if (!ledger) {
            return res.status(201).json({ message: `Can't find any Ledger with ID ${id}`, body: {} });
        }

        return res.status(200).json({ message: "Successful", body: ledger });

    } catch (err) {
        return res.status(500).json({ message: "Failed to track ledger", error: err.message });
    }
};


/*
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

*/
module.exports.getLedgersByDate = async(req, res) => {
    try {
        const { date } = req.params;
        const { id } = req.query;

        // Ensure date is in correct format YYYYMMDD
        if (!date.match(/^\d{8}$/)) {
            return res.status(400).json({ 
                message: "Invalid date format. Expected YYYYMMDD" 
            });
        }

        // Format date string to ISO format
        const formattedDate = date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        const startDate = new Date(`${formattedDate}T00:00:00.000Z`);
        const endDate = new Date(`${formattedDate}T23:59:59.999Z`);

        // Base query object
        const dateQuery = {
            dispatchedAt: {
                $gte: startDate,
                $lte: endDate
            }
        };

        // Add ID filter if provided
        const query = id ? {
            ...dateQuery,
            $or: [{scannedBySource: id}, {scannedByDest: id}]
        } : dateQuery;

        const ledgers = await Ledger.find(query)
            .populate({
                path: 'parcels',
                populate: [
                    { path: 'items' },
                    { path: 'sender' },
                    { path: 'receiver' },
                    { path: 'sourceWarehouse' },
                    { path: 'destinationWarehouse' }
                ]
            })
            .populate({
                path: 'scannedBySource',
                select: '-password'
            })
            .populate({
                path: 'scannedByDest',
                select: '-password'
            })
            .populate({
                path: 'verifiedBySource',
                select: '-password'
            })
            .populate({
                path: 'verifiedByDest',
                select: '-password'
            })
            .populate('sourceWarehouse')
            .populate('destinationWarehouse');

        return res.status(200).json({ 
            message: "Successful", 
            body: ledgers 
        });
    } catch (err) {
        console.error('Error in getLedgersByDate:', err);
        return res.status(500).json({ 
            message: "Failed to get ledgers by date", 
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
        console.log(updateData);
        /* updateData- 
            status('pending', 'dispatched', 'completed')
            vehicleNo(string)
            parcels- {
                    add: [{parcelObj}],
                    del: [mongoId]
                }
            hamali_freight- [{trackingId, hamali, freight}]            
            sourceWarehouse(wh_id)
            destinationWarehouse(whCode)
         */

        if (!id) {
            return res.status(400).json({ message: 'Ledger ID is required' });
        }

        if(!(updateData.status || updateData.vehicleNo || updateData.parcels || updateData.sourceWarehouse || updateData.destinationWarehouse)){
            return res.status(400).json({message: 'No parameters for updation is provided'});
        }

        let ledger = await Ledger.findOne({ ledgerId: id });
        if (!ledger) {
            return res.status(404).json({ message: `Can't find any Ledger with ID ${id}` });
        }

        if(updateData.parcels){
            let delParcels= updateData.parcels.del;
            let addParcels= updateData.parcels.add;
            console.log(delParcels);

            if(!delParcels && !addParcels){
                return res.status(400).json({message: 'No parameters for updating parcels is provided'});
            }

            if(delParcels && delParcels.length>0) {
                for(let pId of delParcels){
                    const temp= await Ledger.findOneAndUpdate({ledgerId: id}, {$pull: {parcels: pId}}, {new: true}); 
                    console.log(temp);
                    await temp.save();
                }
            }

            if(addParcels && addParcels.length>0){
                await Ledger.findOneAndUpdate(
                    { ledgerId: id },
                    { $push: { parcels: { $each: addParcels } } },
                    { new: true }
                );
            }
        }
        
        if(updateData.status) ledger.status=updateData.status;
        if(updateData.vehicleNo) ledger.vehicleNo=updateData.vehicleNo;
        if(updateData.sourceWarehouse) ledger.sourceWarehouse=updateData.sourceWarehouse;
        if(updateData.destinationWarehouse){
            const warehouse= await Warehouse.findOne({warehouseID: updateData.destinationWarehouse});
            ledger.destinationWarehouse=warehouse._id;
        }

        if(updateData.hamali_freight && updateData.hamali_freight.length>0){
            for(let hf of updateData.hamali_freight){
                const parcel= await Parcel.findOne({trackingId: hf.trackingId});
                parcel.hamali=hf.hamali;
                parcel.freight=hf.freight;
                await parcel.save();
            }
        }

        await ledger.save();

        const updatedLedger = await Ledger.findOne({ledgerId: id}).populate({
            path: 'parcels',
            populate: [
                { path: 'items' }, 
                { path: 'sender' },
                { path: 'receiver' },
                { path: 'sourceWarehouse' },
                { path: 'destinationWarehouse' }
            ]
        })
        .populate({
            path: 'scannedBySource scannedByDest verifiedBySource verifiedByDest',
            select: '-password' 
        })
        .populate('sourceWarehouse destinationWarehouse');

        return res.status(200).json({ message: "Ledger updated successfully", body: updatedLedger });
    } catch (err) {
        return res.status(500).json({ message: "Failed to update ledger", error: err.message });
    }
};

module.exports.verifyLedger = async(req, res) => {
    try {
        const { id } = req.params;

        let ledger=await Ledger.findOne({ledgerId:id});

        ledger.status='delivered';
        ledger.deliveredAt=new Date();
        ledger.verifiedByDest=req.user._id;

        await ledger.save();

        return res.status(200).json({ message: "Successful", body: ledger });
    } catch (err) {
        return res.status(500).json({ message: "Failed to get ledgers by date", error: err.message });
    }
}

module.exports.deliverLedger = async(req, res) => {
    try {
        const { codes, vehicleNo } = req.body;
        console.log(codes);

        let ledger= null;
        for(let parcel of codes){
            const p=await Parcel.findOne({trackingId: parcel});
            if(!p){
                return res.status(400).json({message: "Parcel not found"});
            }


            if(!ledger) ledger= await Ledger.findById(p.ledgerId);

            if(ledger && ledger.vehicleNo!=vehicleNo){
                for(let pcl of codes){
                    const temp=await Parcel.findOne({trackingId: pcl});
                    temp.status= 'dispatched';
                    temp.save();
                }

                return res.status(400).json({message: "Selected vehicle no. does not matches this ledger's vehicle no."})
            }
            
            p.status='delivered';
            await p.save();
        }
        ledger.scannedByDest=req.user._id;
        await ledger.save();

        return res.status(200).json({ message: "Successful", flag : true });
    } catch (err) {
        return res.status(500).json({ message: "Failed to get ledgers by date", error: err.message });
    }
}



