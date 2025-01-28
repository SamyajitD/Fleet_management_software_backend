const Driver = require("../models/driverSchema.js");
const Employee= require("../models/employeeSchema.js");
const Warehouse= require("../models/warehouseSchema.js");
const Item= require("../models/itemSchema.js");
const Parcel= require("../models/parcelSchema.js");
const Ledger= require("../models/ledgerSchema.js"); 
const generateUniqueId = require("../utils/uniqueIdGenerator.js");
const {updateParcelStatus} = require('../utils/updateParcelStatus.js');

module.exports.fetchAllEmployees= async(req, res)=>{
    try{
        const allEmployees= await Employee.find().select('-password').populate('warehouseCode');

        if(allEmployees.length===0){
            return res.status(201).json({message: "No employees", body: {}});
        }

        return res.status(200).json({message: "Successfully fetched all employees", body: allEmployees});
    }catch(err){
        return res.status(500).json({message: "Failed to fetch all Employees", error: err.message});
    }
}

module.exports.fetchAllDrivers= async(req, res)=>{
    try{
        const allDrivers= await Driver.find();

        if(allDrivers.length===0){
            return res.status(201).json({message: "No Drivers", body: {}});
        }

        return res.status(200).send({message: "Successfully fetched all Drivers", body: allDrivers});
    }catch(err){
        return res.status(500).json({message: "Failed to fetch all Drivers", error: err.message});
    }
}

module.exports.addDriver = async (req, res) => {
    try {
        const newDriver = new Driver({ ...req.body });
        await newDriver.save();
        return res.status(200).json({ message: "Successfully created a driver", body: newDriver });
    } catch (err) {
        return res.status(500).json({ message: "Failed to create a new driver", err });
    }
}

module.exports.getDriverByVehicleNo = async (req, res) => {
    try {
        const { vehicleNo } = req.params;
        const driver = await Driver.findOne({ vehicleNo });

        if (!driver) {
            return res.status(201).json({ message: `No driver found with vehicle number ${vehicleNo}` });
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

module.exports.updateDriver = async (req, res) => { 
    try {
        const { vehicleNo, updates } = req.body;
        const updatedDriver = await Driver.findOneAndUpdate(
            {vehicleNo},
            {$set: updates},
            {new: true}
        );

        if (!updatedDriver) {
            return res.status(201).json({ message: `No driver found with vehicle number ${vehicleNo}` });
        }

        return res.status(200).json({ message: "Successfully updated driver", body: updatedDriver });

    } catch (err) {
        return res.status(500).json({ message: "Failed to update driver", error: err.message });
    }
}

module.exports.deleteDriver = async (req, res) => {
    try {
        const { vehicleNo } = req.body;
        const driver = await Driver.findOne({ vehicleNo });

        if (!driver) {
            return res.status(201).json({ message: `No driver found with vehicle number ${vehicleNo}` });
        }

        await Driver.deleteOne({ _id: driver._id });

        return res.status(200).json({ message: "Successfully deleted driver", body: driver });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete driver", error: err.message });
    }
}

module.exports.getEmployeeDetails= async(req, res)=>{  
    try{
        const {id}= req.body;
        const employee= await Employee.findById(id).select('-password');

        if(!employee){
            return res.status(201).json({message: `No employee found with ID ${id}`});
        }

        return res.status(200).json({message: "Successfully fetched employee details", body: employee});
    }catch(err){
        return res.status(500).json({message: "Failed to fetch employee details", error: err.message});
    }
}

module.exports.updateEmployee = async (req, res) => { 
    try {
        const { username, updates } = req.body;
        const updatedEmployee = await Employee.findOneAndUpdate(
            {username},
            {$set: updates},
            {new: true}
        );

        if (!updatedEmployee) {
            return res.status(201).json({ message: `No Employee found with username: ${username}` });
        }

        return res.status(200).json({ message: "Successfully updated employee", body: updatedEmployee });

    } catch (err) {
        return res.status(500).json({ message: "Failed to update employee", error: err.message });
    }
}

module.exports.deleteEmployee = async (req, res) => {
    try {
        const { username } = req.body;
        const employee = await Employee.findOne({ username });

        if (!employee) {
            return res.status(201).json({ message: `No employee found with username: ${username}` });
        }

        await Employee.deleteOne({ username });

        return res.status(200).json({ message: "Successfully deleted employee", body: employee });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete employee", error: err.message });
    }
}

module.exports.fetchAllWarehouses= async(req, res)=>{ 
    try{
        const allWarehouses= await Warehouse.find();

        if(allWarehouses.length===0){
            return res.status(201).json({message: "No Warehouses", body: {}});
        }

        return res.status(200).json({message: "Successfully fetched all Warehouses", body: allWarehouses});
    }catch(err){
        return res.status(500).json({message: "Failed to fetch all Warehouses", error: err.message});
    }
}

module.exports.addWarehouse = async (req, res) => {
    try {
        const warehouse = new Warehouse({ ...req.body });
        await warehouse.save();
        return res.status(200).json({ message: "Successfully added a warehouse", body: warehouse });
    } catch (err) {
        return res.status(500).json({ message: "Failed to add a new warehouse", err });
    }
}

module.exports.updateWarehouse = async (req, res) => {
    try {
        const { warehouseID, updates } = req.body;
        const updatedWarehouse = await Warehouse.findOneAndUpdate(
            {warehouseID},
            {$set: updates},
            {new: true}
        );

        if (!updatedWarehouse) {
            return res.status(201).json({ message: `No warehouse found with ID ${warehouseID}` });
        }

        return res.status(200).json({ message: "Successfully updated warehouse", body: updatedWarehouse });

    } catch (err) {
        return res.status(500).json({ message: "Failed to update warehouse", error: err.message });
    }
}

module.exports.deleteWarehouse = async (req, res) => {
    try {
        const { warehouseID } = req.body;
        const warehouse = await Warehouse.findOne({ warehouseID });

        if (!warehouse) {
            return res.status(201).json({ message: `No warehouse found with Code: ${warehouseID}` });
        }

        await Warehouse.deleteOne({ warehouseID });

        return res.status(200).json({ message: "Successfully deleted warehouse", body: warehouse });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete warehouse", error: err.message });
    }
}

module.exports.addItem = async (req, res) => {
    try {
        const { parcelId, name, quantity, dispatchedAt } = req.body;
        const item = new Item({ name, quantity, dispatchedAt, parcelId, itemId: generateUniqueId(14)});
        await item.save();
        return res.status(200).json({ message: "Successfully added an item", body: item });
    } catch (err) {
        return res.status(500).json({ message: "Failed to add a new item", error: err.message });
    }
}

module.exports.updateItem = async (req, res) => {
    try {
        const { itemId, updates } = req.body;
        const updatedItem = await Item.findOneAndUpdate(
            {itemId},
            {$set: updates},
            {new: true}
        );

        if (!updatedItem) {
            return res.status(201).json({ message: `No item found with ID: ${itemId}` });
        }

        return res.status(200).json({ message: "Successfully updated item", body: updatedItem });

    } catch (err) {
        return res.status(500).json({ message: "Failed to update item", error: err.message });
    }
}

module.exports.deleteItem = async (req, res) => {
    try {
        const { itemId } = req.body;
        const item = await Item.findOne({ itemId });

        if (!item) {
            return res.status(201).json({ message: `No item found with ID: ${itemId}` });
        }

        await Item.deleteOne({ itemId });

        return res.status(200).json({ message: "Successfully deleted item", body: item });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete item", error: err.message });
    }
}

module.exports.fetchAllParcels= async(req, res)=>{
    try{
        const allParcels= await Parcel.find().populate('items sender receiver addedBy');

        if(allParcels.length===0){
            return res.status(201).json({message: "No Parcels", body: {}});
        }

        return res.status(200).json({message: "Successfully fetched all Parcels", body: allParcels});
    }catch(err){
        return res.status(500).json({message: "Failed to fetch all Parcels", error: err.message});
    }
}

module.exports.fetchAllItems= async(req, res)=>{
    try{
        const allItems= await Item.find();

        if(allItems.length===0){
            return res.status(201).json({message: "No Items", body: {}});
        }

        return res.status(200).json({message: "Successfully fetched all Items", body: allItems});
    }catch(err){
        return res.status(500).json({message: "Failed to fetch all Items", error: err.message});
    }
}

module.exports.fetchAllLedgers= async(req, res)=>{
    try{
        const allLedgers= await Ledger.find();

        if(allLedgers.length===0){
            return res.status(201).json({message: "No Ledgers Found", body: {}});
        }

        return res.status(200).json({message: "Successfully fetched all Ledgers", body: allLedgers});
    }catch(err){
        return res.status(500).json({message: "Failed to fetch all Ledgers", error: err.message});
    }
}

module.exports.updateParcel = async (req, res) => {
    try {
        const { trackingId, updates } = req.body;
        const {del, add}= updates.items;

        if(del.length!==0){
            for(const id of del){
                const item= await Item.findOne({itemId: id});

                if(item.ledgerId){  
                    const ledger= await Ledger.findOneAndUpdate({ledgerId: item.ledgerId},  {$pull: {items: {itemId: item._id}}});
                    await ledger.save();
                }

                const parcel= await Parcel.findOneAndUpdate({trackingId}, {$pull: {items: item._id}});
                await parcel.save();
                await Item.findByIdAndDelete(item._id);
            }
        }

        const itemIds= [];
        if(add.length!==0){
            for(const item of add){
                const newItem= new Item({...item, parcelId: trackingId , itemId: generateUniqueId(14)});
                await newItem.save();
                itemIds.push(newItem._id);
                const parcel= await Parcel.findOneAndUpdate({trackingId}, {$push: {items: newItem._id}});
                await parcel.save();
            }
        }

        const actualUpdates= {...updates, items: itemIds };
        const updatedParcel = await Parcel.findOneAndUpdate(
            {trackingId},
            {$set: actualUpdates},
            {new: true}
        );

        if (!updatedParcel) {
            return res.status(201).json({ message: `No parcel found with ID: ${trackingId}` });
        }

        await updateParcelStatus(trackingId);

        return res.status(200).json({ message: "Successfully updated parcel", body: updatedParcel });

    } catch (err) {
        return res.status(500).json({ message: "Failed to update parcel", error: err.message });
    }
}

module.exports.deleteParcel = async (req, res) => {
    try {
        const { trackingId } = req.body;
        const parcel = await Parcel.findOne({ trackingId });

        if (!parcel) {
            return res.status(201).json({ message: `No parcel found with ID: ${trackingId}` });
        }

        const itemIds= parcel.items;
        for(const id of itemIds){
            const item= await Item.findById(id);

            if(item.ledgerId){
                const ledger= await Ledger.findOneAndUpdate({ledgerId: item.ledgerId},  {$pull: {items: {itemId: item._id}}});
                await ledger.save();
            }
                
            await Item.findByIdAndDelete(item._id);
        }

        await Client.findByIdAndDelete(parcel.sender);
        await Client.findByIdAndDelete(parcel.receiver);

        await Parcel.deleteOne({ trackingId });

        return res.status(200).json({ message: "Successfully deleted parcel", body: parcel });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete parcel", error: err.message });
    }
}

module.exports.updateLedger = async (req, res) => {
    try {
        const { ledgerId, updates } = req.body;
        const updatedLedger = await Ledger.findOneAndUpdate(
            {ledgerId},
            {$set: updates},
            {new: true}
        );

        if (!updatedLedger) {
            return res.status(201).json({ message: `No ledger found with ID: ${ledgerId}` });
        }

        return res.status(200).json({ message: "Successfully updated ledger", body: updatedLedger });

    } catch (err) {
        return res.status(500).json({ message: "Failed to update ledger", error: err.message });
    }
}

module.exports.deleteLedger = async (req, res) => {
    try {
        const { ledgerId } = req.body;
        const ledger = await Ledger.findOne({ ledgerId });

        if (!ledger) {
            return res.status(201).json({ message: `No ledger found with ID: ${ledgerId}` });
        }

        const itemIds= ledger.items;
        for(const id of itemIds){
            const item= await Item.findById(id);
            delete item.ledgerId;
            item.ledgerId= undefined;
            item.status= 'arrived';
            await item.save();
            await updateParcelStatus(item.parcelId);
        }

        await Ledger.deleteOne({ ledgerId });

        return res.status(200).json({ message: "Successfully deleted ledger", body: ledger });
    } catch (err) {
        return res.status(500).json({ message: "Failed to delete ledger", error: err.message });
    }
}