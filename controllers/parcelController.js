const puppeteer = require('puppeteer');
const Parcel = require("../models/parcelSchema.js");
const Client = require("../models/clientSchema.js");
const Item = require("../models/itemSchema.js");
const generateUniqueId = require("../utils/uniqueIdGenerator.js");
const generateQRCode = require("../utils/qrCodeGenerator.js");
const generateLR = require("../utils/LRreceiptFormat.js");
const Warehouse = require("../models/warehouseSchema.js");
const { updateParcelStatus } = require('../utils/updateParcelStatus.js');

module.exports.newParcel = async(req, res) => {
    try {
        const { items, senderDetails, receiverDetails, destinationWarehouse } = req.body;

        const sourceWarehouse = req.user.warehouseCode;

        const itemEntries = [];
        for (const item of items) {
            // let itemId = generateUniqueId(14)
            const newItem = new Item({
                name: item.name,
                quantity: item.quantity,
                itemId: generateUniqueId(14)
            });
            const savedItem = await newItem.save();
            itemEntries.push(savedItem._id);
        }

        const sender = new Client(senderDetails);
        const receiver = new Client(receiverDetails);

        const newSender = await sender.save();
        const newReceiver = await receiver.save();

        const trackingId = generateUniqueId(12);

        const newParcel = new Parcel({
            items: itemEntries,
            sender: newSender._id,
            receiver: newReceiver._id,
            sourceWarehouse,
            destinationWarehouse,
            trackingId,
            addedBy: req.user._id
        });

        await newParcel.save();

        for (const id of itemEntries) {
            const item = await Item.findById(id);
            item.parcelId = newParcel._id;
            await item.save();
        }

        await updateParcelStatus(trackingId);

        return res.status(200).json({ message: "Parcel created successfully", body: { flag: true, trackingId } });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while creating the parcel", error: err.message });
    }
};

module.exports.trackParcel = async(req, res) => {
    try {
        const { id } = req.params;
        const parcel = await Parcel.findOne({ trackingId: id }).populate('items sender receiver');

        if (!parcel) {
            return res.status(201).json({ message: `Can't find any Parcel with Tracking Id. ${id}`, body: {} });
        }

        return res.status(200).json({ message: "Successfully fetched your parcel", body: parcel });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while tracking your parcel", error: err.message });
    }
}

module.exports.allParcel = async(req, res) => {
    try {
        // Add debug logs
        // console.log('User from token:', req.user);
        // console.log('Warehouse code:', req.user?.warehouseCode);

        if ((!req.user || !req.user.warehouseCode) &&!req.user.role === 'admin') {
            return res.status(401).json({
                message: "Unauthorized: No warehouse access"
            });
        }

        const newDate = new Date(req.body.date);
        const startDate = new Date(newDate);
        const endDate = new Date(newDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Use the authenticated user's warehouse code
        const employeeWHcode = req.user.warehouseCode;

        const allWarehouses = await Warehouse.find().lean();

        let parcels = await Parcel.find({
                placedAt: { $gte: startDate, $lt: endDate },
                sourceWarehouse: employeeWHcode
            })
            .populate('items sender receiver')
            .lean();


        const parcelsWithWarehouseNames = parcels.map(parcel => {
            const sourceWH = allWarehouses.find(wh => wh.warehouseID === parcel.sourceWarehouse);
            const destWH = allWarehouses.find(wh => wh.warehouseID === parcel.destinationWarehouse);

            return {
                ...parcel,
                sourceWarehouseName: sourceWH?.name || 'Unknown',
                destinationWarehouseName: destWH?.name || 'Unknown'
            }
        });

        return res.status(200).json(parcelsWithWarehouseNames);

    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({
            message: "Error fetching parcels",
            error: err.message
        });
    }
};


module.exports.generateQRCodes = async(req, res) => {
    try {
        const { id } = req.params;
        const parcel = await Parcel.findOne({ trackingId: id }).populate('items');

        if (!parcel) {
            return res.status(201).json({ message: `Parcel not found. Tracking ID: ${id}`, body: [] });
        }

        let qrCodes = [];
        for (let item of parcel['items']) {
            let qrObj = await generateQRCode(item.itemId);
            qrCodes.push(qrObj);
        }

        return res.status(200).json({ message: "Successfully generated QR codes for the parcel items", body: qrCodes });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while tracking your parcel", error: err.message });
    }
}

module.exports.generateLR = async(req, res) => {
    try {
        const { id } = req.params;
        const parcel = await Parcel.findOne({ trackingId: id }).populate('items sender receiver');

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const htmlContent = generateLR(parcel);
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
        return res.status(500).json({ message: "Failed to generate LR Receipt", error: err.message });
    }
}

module.exports.appendItemsToParcel = async(req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        const parcel = Parcel.findOne({ trackingId: id });
        for (const item of items) {
            // let itemId = generateUniqueId(14)
            const newItem = new Item({
                name: item.name,
                quantity: item.quantity,
                itemId: generateUniqueId(14)
            });
            await newItem.save();
            parcel.items.push(item._id);
        }

        await parcel.save();
        await updateParcelStatus(id);
        return res.status(200).json({ message: "Items appended to parcel successfully",flag: true });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while appending items to the parcel", error: err.message });
    }
};