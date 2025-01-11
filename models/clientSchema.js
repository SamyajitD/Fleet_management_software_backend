const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    phoneNo: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: false
    },

    role: {
        type: String,
        enum: ['sender', 'receiver'],
        required: true
    },
});


module.exports = mongoose.model('Client', clientSchema);