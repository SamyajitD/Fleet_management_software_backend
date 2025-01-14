const Driver = require("../models/driverSchema.js");

module.exports.newDriver = async(req, res) => {
    try {
        const newDriver = new Driver({...req.body });
        await newDriver.save();
        res.status(201).json({ message: "Successfully created a driver", driver: newDriver });
    } catch (err) {
        res.status(500).json({ message: "Failed to create a new driver", err });
    }
}

module.exports.allTruckNo = async(req, res) => {
    try {
        const allTruckNo = await Driver.find({}, 'vehicleNo');
        if (allTruckNo) {
            return res.status(200).send(allTruckNo);
        } else {
            return res.json("No Truck number found");
        }
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch truck numbers", err });
    }
}

module.exports.getDriverByVehicleNo = async(req, res) => {
    try {
        const { vehicleNo } = req.params;
        const driver = await Driver.findOne({ vehicleNo });

        if (!driver) {
            return res.status(404).json({ message: `No driver found with vehicle number ${vehicleNo}` });
        }

        res.status(200).json({
            message: "Successfully found driver",
            driver: {
                name: driver.name,
                phoneNo: driver.phoneNo
            }
        });

    } catch (err) {
        res.status(500).json({ message: "Failed to fetch driver details", error: err.message });
    }
}