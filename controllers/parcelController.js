const puppeteer = require('puppeteer');
const Parcel = require("../models/parcelSchema.js");
const Client = require("../models/clientSchema.js");
const Item = require("../models/itemSchema.js");
const generateUniqueId = require("../utils/uniqueIdGenerator.js");
const generateQRCode = require("../utils/qrCodeGenerator.js");
const generateLR = require("../utils/LRreceiptFormat.js");
const Warehouse = require("../models/warehouseSchema.js");

module.exports.newParcel = async(req, res) => {
    try {
        let { items, senderDetails, receiverDetails, destinationWarehouse,sourceWarehouse } = req.body;
        if(!sourceWarehouse)
            sourceWarehouse = req.user.warehouseCode;

        const destinationWarehouseId= await Warehouse.findOne({warehouseID: destinationWarehouse});

        const itemEntries = [];
        for (const item of items) {
            const newItem = new Item({
                name: item.name,
                quantity: item.quantity,
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
            destinationWarehouse: destinationWarehouseId._id,
            trackingId,
            addedBy: req.user._id
        });

        await newParcel.save();

        return res.status(200).json({ message: "Parcel created successfully", body: { flag: true, trackingId } });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while creating the parcel", error: err.message });
    }
};

module.exports.trackParcel = async(req, res) => {
    try {
        const { id } = req.params;
        const parcel = await Parcel.findOne({ trackingId: id }).populate('items sender receiver sourceWarehouse destinationWarehouse addedBy');

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

        const employeeWHcode = req.user.warehouseCode;

        const allWarehouses = await Warehouse.find();

        let parcels;
        if(req.user.role!=='admin'){
            parcels=  await Parcel.find({
                placedAt: { $gte: startDate, $lte: endDate },
                $or: [{sourceWarehouse: employeeWHcode}, {destinationWarehouse: employeeWHcode}]
            })
            .populate('items sender receiver sourceWarehouse destinationWarehouse addedBy');
        }else{
            parcels= await Parcel.find({
                placedAt: { $gte: startDate, $lte: endDate },
            })
            .populate('items sender receiver sourceWarehouse destinationWarehouse addedBy');
        }

        return res.status(200).json(parcels);

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

        const parcel = await Parcel.findOne({ trackingId: id });
        for (const item of items) {
            const newItem = new Item({
                name: item.name,
                quantity: item.quantity,
            });
            await newItem.save();
            parcel.items.push(item._id);
        }

        await parcel.save();
        return res.status(200).json({ message: "Items appended to parcel successfully",flag: true });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while appending items to the parcel", error: err.message });
    }
};

module.exports.DeleteItemsFromParcel = async(req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        const parcel = await Parcel.findOne({ trackingId: id });
        
        if(!parcel){
            return res.status(201).json({ message: "Parcel not found",flag: false });
        }

        for (const itemId of items) {
            const itemIndex = parcel.items.indexOf(itemId);
            console.log(itemIndex);
            if (itemIndex > -1) {
                parcel.items.splice(itemIndex, 1);
                await Item.findByIdAndDelete(itemId);
            }
        }


        await parcel.save();
        return res.status(200).json({ message: "Items deleted to parcel successfully",flag: true });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while deleting items to the parcel", error: err.message });
    }
};


module.exports.editParcel = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (!id) {
            return res.status(400).json({ message: 'Parcel ID is required' });
        }

        if (!updateData || Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Update data is required' });
        }

        let parcel = await Parcel.findOne({ trackingId: id });
        if (!parcel) {
            return res.status(404).json({ message: `Can't find any Parcel with Tracking ID ${id}` });
        }

        // Update items if provided
        if (updateData.items) {
            const itemEntries = [];
            for (const item of updateData.items) {
                const newItem = new Item({
                    name: item.name,
                    quantity: item.quantity,
                });
                const savedItem = await newItem.save();
                itemEntries.push(savedItem._id);
            }
            updateData.items = itemEntries;
        }

        // Update sender details if provided
        if (updateData.senderDetails) {
            const sender = await Client.findById(parcel.sender);
            if (sender) {
                Object.assign(sender, updateData.senderDetails);
                await sender.save();
            }
        }

        // Update receiver details if provided
        if (updateData.receiverDetails) {
            const receiver = await Client.findById(parcel.receiver);
            if (receiver) {
                Object.assign(receiver, updateData.receiverDetails);
                await receiver.save();
            }
        }

        // Update destination warehouse if provided
        if (updateData.destinationWarehouse) {
            const destinationWarehouseId = await Warehouse.findOne({ warehouseID: updateData.destinationWarehouse });
            if (destinationWarehouseId) {
                updateData.destinationWarehouse = destinationWarehouseId._id;
            }
        }

        // Update source warehouse if provided
        if (updateData.sourceWarehouse) {
            updateData.sourceWarehouse = updateData.sourceWarehouse;
        }

        const fieldsToUpdate = {};
        for (const key in updateData) {
            if (updateData.hasOwnProperty(key)) {
                fieldsToUpdate[key] = updateData[key];
            }
        }

        const updatedParcel = await Parcel.findByIdAndUpdate(
            parcel._id,
            { $set: fieldsToUpdate },
            { new: true, runValidators: true }
        ).populate('items sender receiver sourceWarehouse destinationWarehouse addedBy');

        return res.status(200).json({ message: "Parcel updated successfully", body: updatedParcel });
    } catch (err) {
        return res.status(500).json({ message: "Failed to update parcel", error: err.message });
    }
};

