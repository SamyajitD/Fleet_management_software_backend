const Ledger = require("../models/ledgerSchema.js");
const Item = require("../models/itemSchema.js");

module.exports.newLedger = async(req, res) => {

    try {
        const scannedIds= req.body.codes;
        let itemIds= [];

        for(let id of scannedIds){
            const item= await Item.findOne({itemId: id});
            if(!item) continue;
            itemIds.push(item._id);
        }

        const newLedger = new Ledger({
            vehicleNo: req.body.vehicleNo,
            charges: 1000,
            dispatchedAt: new Date(),
            itemIds
        });

        await newLedger.save();
        return res.status(200).json({ message: "Successfully created ledger entry", ledger: newLedger });
    } catch (err) {
        res.status(500).json({ message: "Failed to create a new driver", err });
    }
};