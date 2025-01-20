const mongoose = require('mongoose');
const passportLocalMongoose= require('passport-local-mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    //emailId
    username: {
        type: String,
        unique: true,
        required: true
    },

    phoneNo: {
        type: String,
        required: true
    },

    warehouseCode:{
        type: String,
        enum: ['HYO', 'HYT', 'BHP', 'SEC', 'MNC', 'KMR', 'STD', 'PLY', 'RMG', 'GDV'],
        required: true
    },

    role: {
        type: String,
        enum: ['admin', 'supervisor', 'staff'],
        required: true
    }
});

employeeSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Employee', employeeSchema);