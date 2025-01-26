const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    parcelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parcel'
    },

    ledgerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ledger'
    },

    name: {
        type: String,
        required: true
    },

    quantity: {
        type: Number,
        required: true
    },

    // dipatchedAt: {
    //     type: Date,
    // },

    // deliveredAt: {
    //     type: Date,
    // },

    status: {
        type: String,
        enum: ['arrived', 'pending', 'dispatched', 'delivered'],
        default: 'arrived',
        required: true
    }
});

module.exports = mongoose.model('Item', itemSchema);