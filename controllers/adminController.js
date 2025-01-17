const Employee= require("../models/employeeSchema.js");

module.exports.fetchAllEmployees= async(req, res)=>{
    try{
        const allEmployees= await Employee.find();

        if(!allEmployees){
            return res.status(201).json({message: "No employees", body: {}});
        }

        return res.status(200).json({message: "Successfully fetched all employees", body: allEmployees});
    }catch(err){
        return res.status(500).json({message: "Failed to fetch all Employees", error: err.message});
    }
}