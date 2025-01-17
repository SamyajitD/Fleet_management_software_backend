const Employee= require("../models/employeeSchema.js");
const Driver= require("../models/driverSchema.js");

module.exports.fetchAllEmployees= async(req, res)=>{
    try{
        const allEmployees= await Employee.find();

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