const Employee = require("../models/employeeSchema.js");
const Warehouse = require("../models/warehouseSchema.js");
const jsonwebtoken = require('jsonwebtoken');
const {sendOTPMessage, verifyOTP} = require('../utils/whatsappMessageSender.js');

module.exports.register = async (req, res) => {
    try {
        const { username, password, name, phoneNo, warehouseID, role } = req.body;
        const warehouseCode = await Warehouse.findOne({warehouseID});
        const employee = new Employee({ 
            username, 
            password, 
            name, 
            phoneNo, 
            warehouseCode: warehouseCode._id, 
            role
        });

        await employee.save();
        
        const token = jsonwebtoken.sign({ id: employee._id }, process.env.JWT_SECRET);
        return res.status(201).json({ token ,flag:true});
    } catch (error) {
        return res.status(400).json({ message: error.message });
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
            flag:true,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.getStatus= async(req, res) => {
    try{
        // console.log(req.user);
        const warehouse= await Warehouse.findById(req.user.warehouseCode);
        return res.status(200).json({
            flag: true,
            user: {
                id: req.user._id,
                username: req.user.username,
                role: req.user.role,
                name: req.user.name,
                phoneNo: req.user.phoneNo,
                warehouseCode: warehouse.warehouseID,
                isSource: warehouse.isSource
            }
        });
    }catch(err){
        return res.status(500).json({ message: "Failed to get user status", error: err.message });
    }
}

module.exports.getAllUsernames= async(req, res)=>{
    try{
        const allUsernames= await Employee.find({}).select('username -_id');
        return res.status(200).send({message: "Successfully fetched all users", body: allUsernames});
    }catch(err){
        return res.status(500).json({message: "Failed to fetch all usernames", err: err.message});
    }
}

module.exports.getOTP= async (req, res) => {
    try {
        const { username } = req.body;
        console.log(username)
        const employee = await Employee.findOne({ username });

        console.log(employee)

        if (!employee) {
            return res.status(201).json({ message: 'User not found', flag: false });
        }

        await sendOTPMessage(employee.phoneNo);
        return res.status(200).json({ message: 'Successfully sent OTP', phoneNo: employee.phoneNo,  flag: true });
        
    } catch (err) {
        res.status(500).json({ message: 'Failed to Send OTP', error: err.message });
    }
}
module.exports.verifyOtp = async (req, res) => {
    try {
        const { phoneNo, otp } = req.body;
        const result = await verifyOTP(phoneNo, otp);
        console.log(result);
        if (result) {
            const token = jsonwebtoken.sign(
                { phoneNo, isOTPVerified: true },
                process.env.JWT_SECRET,
                { expiresIn: '25m' }
            );
            return res.status(200).json({ 
                message: 'OTP verified',
                token,
                flag: true 
            });
        }
        return res.status(201).json({ message: 'Invalid OTP', flag: false });
    } catch (err) {
        res.status(500).json({ message: 'Failed to Verify OTP', error: err.message });
    }
};

module.exports.resetPassword = async (req, res) => {
    try {
        const { username, password } = req.body;
        const employee = await Employee.findOne({ username });

        if (!employee) {
            return res.status(201).json({ message: 'User not found', flag: false });
        }

        employee.password = password;
        await employee.save();
        return res.status(200).json({ message: 'Password reset successful', flag: true });
    } catch (err) {
        res.status(500).json({ message: 'Failed to reset password', error: err.message });
    }
}