const Driver = require("../models/driverSchema.js");

module.exports.allTruckNo = async (req, res) => {
    try {
        const allTruckNo = await Driver.find({}, 'vehicleNo');
        if (allTruckNo) {
            return res.status(200).json({ message: "Successfull", body: allTruckNo });
        } else {
            return res.status(201).json({ message: "No Truck number found", body:[] });
        }
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch truck numbers", err });
    }
}