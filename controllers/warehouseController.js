const Parcel = require("../models/parcelSchema.js");

module.exports.getAllItems = async(req, res) => {
    try {
        const allItems = await Parcel.find().populate('items sender receiver');
        return res.status(200).json({message: "Successfull", body: allItems});
    } catch (err) {
        return res.status(500).json({ "error": err });
    }
}