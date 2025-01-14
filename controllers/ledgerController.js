const Ledger = require("../models/ledgerSchema.js");
const Item = require("../models/itemSchema.js");

module.exports.newLedger = async(req, res) => {

    try {
        // console.log(codes)
        const newLedger = new Ledger({
            vehicleNo: req.body.vehicleNo,
            charges: 1000, // Hardcoded value
            isComplete: false, // Default value
            dispatchedAt: new Date(), // Current date
            itemIds: req.body.codes
        });

        await newLedger.save();
        return res.status(201).json({ message: "Successfully created ledger entry", ledger: newLedger });
    } catch (err) {
        res.status(500).json({ message: "Failed to create a new driver", err });
    }
};