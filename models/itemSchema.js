const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },

    quantity:{
        type: Number,
        required: true
    },

    status:{
        type: String,
        enum: ['received', 'dispatched', 'delivered'],
        required: true,
        default: 'received'
    }
});

module.exports = mongoose.model('Item', itemSchema);