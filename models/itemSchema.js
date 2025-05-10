const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    type:{
        type: String,
        enum: ['C/B', 'G/B', 'Bundle'],
        required: true
    },

    freight:{
        type: Number,
        required: true,
        default: 0
    },
    
    hamali:{
        type: Number,
        required: true,
        default: 0
    },

    statisticalCharges:{
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('Item', itemSchema);