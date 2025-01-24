const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ledgerSchema = new mongoose.Schema({
    ledgerId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    vehicleNo: {
        type: String,
        required: true,
        index: true
    },

    charges: {
        type: Number
            // required: false
    },

    status: {
        type: String,
        enum: ['dispatched', 'pending', 'completed'],
        default: 'pending',
        required: true,
    },

    dispatchedAt: {
        type: Date,
        required: false
    },

    deliveredAt: {
        type: Date,
    },

    items: [{
        itemId: {
            type: String,
            ref: 'Item',
            required: true
        },
        hamali: {
            type: Number,
            required: false,
            default: 0
        },
        fright: {
            type: Number,
            required: false,
            default: 0
        },
        _id: false
    }],

    scannedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },

    verifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
    },

    scannedByDest: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },

    verifiedByDest: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
    },

    destinationWarehouse: {
        type: String,
        enum: ['MNC', 'KMR', 'STD', 'PLY', 'RMG', 'GDV'],
        required: false
    },

    sourceWarehouse: {
        type: String,
        enum: ['HYO', 'HYT', 'BHP', 'SEC'],
        required: false
    }
});

module.exports = mongoose.model('Ledger', ledgerSchema);