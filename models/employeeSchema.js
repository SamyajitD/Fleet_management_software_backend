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

    role: {
        type: String,
        enum: ['staff', 'admin'],
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
    }
});

employeeSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Employee', employeeSchema);