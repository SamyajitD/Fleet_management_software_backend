const Employee = require("../models/employeeSchema.js");
const jsonwebtoken = require('jsonwebtoken');

module.exports.register = async (req, res) => {
    try {
        const { username, password, name, phoneNo, warehouseCode, role } = req.body;
        const employee = new Employee({ 
            username, 
            password, 
            name, 
            phoneNo, 
            warehouseCode, 
            role
        });

        await employee.save();
        
        const token = jsonwebtoken.sign({ id: employee._id }, process.env.JWT_SECRET);
        res.status(201).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

module.exports.login= async (req, res) => {
    try {
        const { username, password } = req.body;
        const employee = await Employee.findOne({ username });
        
        if (!employee || !(await employee.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jsonwebtoken.sign({ id: employee._id }, process.env.JWT_SECRET);
        res.json({ 
            token,
            user: {
                id: employee._id,
                username: employee.username,
                name: employee.name,
                role: employee.role,
                warehouseCode: employee.warehouseCode,
                phoneNo: employee.phoneNo
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getStatus= (req, res) => {
    res.status(200).json({
        flag: true,
        user: {
            id: req.user._id,
            username: req.user.username,
            role: req.user.role,
            name: req.user.name,
            phoneNo: req.user.phoneNo,
            warehouseCode: req.user.warehouseCode
        }
    });
}