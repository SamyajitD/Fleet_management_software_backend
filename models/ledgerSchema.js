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
        freight: {
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
        required: false
    },

    verifiedByDest: {
        type: Schema.Types.ObjectId,
        ref: 'Employee',
    },

    sourceWarehouse: {
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: false
    },

    destinationWarehouse: {
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: false
    }

});

module.exports = mongoose.model('Ledger', ledgerSchema);