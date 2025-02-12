const puppeteer = require('puppeteer');
const Parcel = require("../models/parcelSchema.js");
const Client = require("../models/clientSchema.js");
const Item = require("../models/itemSchema.js");
const generateUniqueId = require("../utils/uniqueIdGenerator.js");
const generateQRCode = require("../utils/qrCodeGenerator.js");
const generateLR = require("../utils/LRreceiptFormat.js");
const Warehouse = require("../models/warehouseSchema.js");

module.exports.newParcel = async (req, res) => {
    try {
        let { items, senderDetails, receiverDetails, destinationWarehouse, sourceWarehouse } = req.body;
        if (!sourceWarehouse) {
            sourceWarehouse = req.user.warehouseCode;
        }
        else {
            sourceWarehouse = (await Warehouse.findOne({ warehouseID: sourceWarehouse }))._id;
        }

        const destinationWarehouseId = await Warehouse.findOne({ warehouseID: destinationWarehouse });
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
        // sourceWarehouse
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

        return res.status(200).json({ message: "Parcel created successfully", body: trackingId });

    } catch (err) {
        return res.status(500).json({ message: "An error occurred while creating the parcel", error: err.message });
    }
};

module.exports.trackParcel = async (req, res) => {
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

module.exports.allParcel = async (req, res) => {
    try {
        if ((!req.user || !req.user.warehouseCode) && !req.user.role === 'admin') {
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
        if (req.user.role !== 'admin') {
            parcels = await Parcel.find({
                placedAt: { $gte: startDate, $lte: endDate },
                $or: [{ sourceWarehouse: employeeWHcode }, { destinationWarehouse: employeeWHcode }]
            })
                .populate('items sender receiver sourceWarehouse destinationWarehouse addedBy');
        } else {
            parcels = await Parcel.find({
                placedAt: { $gte: startDate, $lte: endDate },
            })
                .populate('items sender receiver sourceWarehouse destinationWarehouse addedBy');
        }

        return res.status(200).json({ body: parcels, message: "Successfully fetched all parcels", flag: true });

    } catch (err) {
        console.error('Error:', err);
        return res.status(500).json({
            message: "Error fetching parcels",
            error: err.message,
            flag: false
        });
    }
};

module.exports.generateQRCodes = async (req, res) => {
    try {
        const { id } = req.params;
        const { count = 1 } = req.query;

        const parcel = await Parcel.findOne({ trackingId: id });
        if (!parcel) {
            return res.status(404).json({ message: `Parcel not found. Tracking ID: ${id}` });
        }

        const { qrCodeURL } = await generateQRCode(id);

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @page { 
                        size: A4; 
                        margin: 5mm;
                    }
                    body { 
                        margin: 0;
                        padding: 0;
                    }
                    .page {
                        position: relative;
                        height: 287mm;
                        page-break-after: always;
                    }
                    .qr-container {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        grid-template-rows: repeat(3, 90mm);
                        position: relative;
                        z-index: 2;
                        padding: 5mm;
                    }
                    .qr-item {
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 90mm;
                    }
                    .qr-code {
                        width: 70mm;
                        height: 70mm;
                    }
                    .tracking-id {
                        margin-top: 0;
                        font-weight: bold;
                        font-size: 12pt;
                    }
                    .cut-lines {
                        position: absolute;
                        top: 5mm;
                        left: 5mm;
                        right: 5mm;
                        bottom: 5mm;
                        z-index: 1;
                    }
                    .vertical-line {
                        position: absolute;
                        border-left: 1px dashed #000;
                        height: 100%;
                        left: 50%;
                    }
                    .horizontal-line-1 {
                        position: absolute;
                        border-top: 1px dashed #000;
                        width: 100%;
                        top: 90mm;
                    }
                    .horizontal-line-2 {
                        position: absolute;
                        border-top: 1px dashed #000;
                        width: 100%;
                        top: 180mm;
                    }
                </style>
            </head>
            <body>
                ${Array.from({ length: Math.ceil(count / 6) }, (_, pageIndex) => `
                    <div class="page">
                        <div class="cut-lines">
                            <div class="vertical-line"></div>
                            ${(pageIndex * 6 + 2) <= count ? '<div class="horizontal-line-1"></div>' : ''}
                            ${(pageIndex * 6 + 4) <= count ? '<div class="horizontal-line-2"></div>' : ''}
                        </div>
                        <div class="qr-container">
                            ${Array.from({ length: Math.min(6, count - pageIndex * 6) }, () => `
                                <div class="qr-item">
                                    <img src="${qrCodeURL}" class="qr-code" alt="QR Code">
                                    <div class="tracking-id">${id}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </body>
            </html>
        `;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            preferCSSPageSize: true
        });

        await browser.close();

        const filename = `qr-codes-${id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        res.end(pdfBuffer);

    } catch (err) {
        console.error('Error generating QR codes:', err);
        return res.status(500).json({
            message: "Failed to generate QR codes",
            error: err.message
        });
    }
};

module.exports.generateLR = async (req, res) => {
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
        if (updateData.addItems) {
            for (const item of updateData.addItems) {
                const newItem = new Item({
                    name: item.name,
                    quantity: item.quantity,
                });
                await newItem.save();
                parcel.items.push(newItem._id);
            }
        }

        if (updateData.delItems) {
            for (const itemId of updateData.delItems) {
                const itemIndex = parcel.items.indexOf(itemId);
                if (itemIndex > -1) {
                    parcel.items.splice(itemIndex, 1);
                    await Item.findByIdAndDelete(itemId);
                }
            }
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
            const sourceWarehouseId = await Warehouse.findOne({ warehouseID: updateData.sourceWarehouse });
            if (sourceWarehouseId) {
                updateData.sourceWarehouse = sourceWarehouseId._id;
            }
        }

        if (updateData.status) {
            parcel.status = updateData.status;
        }
        await parcel.save();

        return res.status(200).json({ flag: true, message: "Parcel updated successfully", body: parcel });
    } catch (err) {
        return res.status(500).json({ flag: false, message: "Failed to update parcel", error: err.message });
    }
};

