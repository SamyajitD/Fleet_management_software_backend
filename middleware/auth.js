const jsonwebtoken = require('jsonwebtoken');
const Employee = require('../models/employeeSchema');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Authorization token required' });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        const user = await Employee.findById(decoded.id).populate('warehouseCode');
        
        if (!user) {
            throw new Error('User not found');
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(201).json({ message: 'Please authenticate' , flag: false});
    }
};

const isAdmin = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(201).json({ message: 'Access denied. Only Admin can access this', flag: false });
    }
    next();
};

const isSupervisor = async (req, res, next) => {
    if (req.user.role === 'staff') {
        return res.status(201).json({ message: 'Access denied. Only Supervisor & Admin can access this', flag: false });
    }
    next();
};

const isAppUser = async (req, res, next) => {
    if (!(req.user.role === 'staff' || req.user.role === 'admin')) {
        return res.status(201).json({ message: 'Access denied. Only Staff & Admin can access app', flag: false });
    }
    next();
};

const verifyOTPToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(201).json({ message: 'Please verify OTP first' });
        }
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        if (!decoded.isOTPVerified) {
            return res.status(201).json({ message: 'Invalid verification' });
        }
        next();
    } catch (err) {
        console.log(err);
        return res.status(201).json({ message: 'Invalid token' });
    }
};

module.exports = { authenticateToken, isAdmin, isSupervisor, isAppUser, verifyOTPToken };