const Driver = require("../models/driverSchema.js");

module.exports.newDriver = async (req, res) => {
    try {
        const newDriver = new Driver({ ...req.body });
        await newDriver.save();
        return res.status(200).json({ message: "Successfully created a driver", body: newDriver });
    } catch (err) {
        return res.status(500).json({ message: "Failed to create a new driver", err });
    }
}

module.exports.allTruckNo = async (req, res) => {
    try {
        const allTruckNo = await Driver.find({}, 'vehicleNo');
        if (allTruckNo) {
            return res.status(200).json({ message: "Successfull", body: allTruckNo });
        } else {
            return res.status(204).json({ message: "No Truck number found", body:[] });
        }
    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch truck numbers", err });
    }
}

module.exports.getDriverByVehicleNo = async (req, res) => {
    try {
        const { vehicleNo } = req.params;
        const driver = await Driver.findOne({ vehicleNo: vehicleNo });

        if (!driver) {
            return res.status(204).json({ message: `No driver found with vehicle number ${vehicleNo}` });
        }

        return res.status(200).json({
            message: "Successfully found driver",
            body: {
                name: driver.name,
                phoneNo: driver.phoneNo
            }
        });

    } catch (err) {
        return res.status(500).json({ message: "Failed to fetch driver details", error: err.message });
    }
}