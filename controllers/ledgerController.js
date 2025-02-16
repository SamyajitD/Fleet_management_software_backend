// const puppeteer = require('puppeteer');
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
const {sendDeliveryMessage}= require("../utils/whatsappMessageSender.js");
const { Cluster } = require('puppeteer-cluster');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

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



module.exports.generatePDF = async (req, res) => {
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
            return res.status(404).json({ message: `Can't find any Ledger with ID ${id}` });
        }

        console.log('Launching Puppeteer...');
        const browser = await puppeteer.launch({
            args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: await chromium.executablePath(),
            headless: 'new', 
            ignoreHTTPSErrors: true,
        });

        const page = await browser.newPage();

        console.log('Setting page content...');
        const htmlContent = generateLedger(ledger);
        await page.setContent(htmlContent, { waitUntil: 'load' });

        console.log('Generating PDF...');
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
        });

        await browser.close();

        console.log('Sending PDF response...');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${id}.pdf"`);
        res.end(pdfBuffer);
    } catch (err) {
        console.error('Error generating PDF:', err);
        return res.status(500).json({ message: "Failed to generate Ledger PDF", error: err.message });
    }
};


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
        const { forApp="false" } = req.query;

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

        let query= null;
        const id= req.user._id;
        const user= await Employee.findById(id);

        if(forApp=="true"){
            query= {
                ...dateQuery,
                $or: [{scannedBySource: id}, {scannedByDest: id}]
            }
        }else if(user.role==="admin"){ 
            query= dateQuery
        }else{
            query= {
                ...dateQuery, 
                $or: [{sourceWarehouse: user.warehouseCode}, {destinationWarehouse: user.warehouseCode}]
            }
        } 

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


module.exports.generateExcel = async (req, res) => {
    try {
        const { dateRange } = req.params;
        const { vehicleNo } = req.query;

        const isForVehicle = vehicleNo !== undefined;

        if (!dateRange || dateRange.length !== 16) {
            return res.status(400).json({ message: "Invalid date range format" });
        }

        let startString = dateRange.slice(0, 8);
        let endString = dateRange.slice(8);

        startString = startString.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
        endString = endString.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');

        const startDate = new Date(`${startString}T00:00:00.000Z`);
        const endDate = new Date(`${endString}T23:59:59.999Z`);
        
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
                        vehicleNo: vehicleNo
                    }
                ]
            }).populate('scannedBySource verifiedBySource scannedByDest verifiedByDest sourceWarehouse destinationWarehouse');
        } else {
            allLedgers = await Ledger.find({ dispatchedAt: { $gte: startDate, $lte: endDate } })
            .populate('scannedBySource verifiedBySource scannedByDest verifiedByDest sourceWarehouse destinationWarehouse');
        }
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Ledger Report');

        worksheet.columns = [
            { header: 'Ledger ID', key: 'ledgerId', width: 20 },
            { header: 'Vehicle No', key: 'vehicleNo', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Dispatched At', key: 'dispatchedAt', width: 20 },
            { header: 'Delivered At', key: 'deliveredAt', width: 20 },
            { header: 'Parcel Count', key: 'parcels', width: 15 },
            { header: 'Scanned By Source', key: 'scannedBySource', width: 20 },
            { header: 'Verified By Source', key: 'verifiedBySource', width: 20 },
            { header: 'Scanned By Dest', key: 'scannedByDest', width: 20 },
            { header: 'Verified By Dest', key: 'verifiedByDest', width: 20 },
            { header: 'Source Warehouse', key: 'sourceWarehouse', width: 20 },
            { header: 'Destination Warehouse', key: 'destinationWarehouse', width: 20 },
        ];

        for (const ledger of allLedgers) {
            worksheet.addRow({
                ledgerId: ledger.ledgerId,
                vehicleNo: ledger.vehicleNo,
                status: ledger.status,
                dispatchedAt: ledger.dispatchedAt,
                deliveredAt: ledger.deliveredAt,
                parcels: ledger.parcels.length,
                scannedBySource: ledger.scannedBySource?.name || '',
                verifiedBySource: ledger.verifiedBySource?.name || '',
                scannedByDest: ledger.scannedByDest?.name || '',
                verifiedByDest: ledger.verifiedByDest?.name || '',
                sourceWarehouse: ledger.sourceWarehouse?.warehouseID || '',
                destinationWarehouse: ledger.destinationWarehouse?.warehouseID || '',
            });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Ledger Report ${isForVehicle ? `(${vehicleNo})` : ''} - ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}.xlsx"`);

        await workbook.xlsx.write(res);
        return res.end();
    } catch (err) {
        return res.status(500).json({ message: "Failed to generate ledger report", error: err.message });
    }
};

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

        ledger.status='completed';
        ledger.deliveredAt=new Date();
        ledger.verifiedByDest=req.user._id;

        await ledger.save();

        for(let id of ledger.parcels){
            const parcel= await Parcel.findById(id).populate('sender receiver');
            sendDeliveryMessage(parcel.sender.phoneNo, parcel.sender.name, parcel.trackingId);
            sendDeliveryMessage(parcel.receiver.phoneNo, parcel.receiver.name, parcel.trackingId);
        }

        return res.status(200).json({ message: "Successful", body: ledger });
    } catch (err) {
        return res.status(500).json({ message: "Failed to get ledgers by date", error: err.message });
    }
}

module.exports.deliverLedger = async(req, res) => {
    try {
        const { codes, vehicleNo } = req.body;
        // console.log(codes);

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
        ledger.status= 'verified';
        ledger.scannedByDest=req.user._id;
        await ledger.save();

        return res.status(200).json({ message: "Successful", flag : true });
    } catch (err) {
        return res.status(500).json({ message: "Failed to get ledgers by date", error: err.message });
    }
}