const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const parcelSchema = new mongoose.Schema({
    trackingId:{
        type: String,
        required: true,
        unique: true
    },

    items: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Item'
        }
    ],

    sender: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
    },

    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
    },

    sourceWarehouse:{
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: false
    },
    
    destinationWarehouse:{
        type: Schema.Types.ObjectId,
        ref: 'Warehouse',
        required: false
    },
    
    status: {
        type: String,
        enum:['arrived', 'partial', 'delivered'],
        default: 'arrived',
        required: true
    },

    hamali: {
        type: Number,
        required: true,
        default: 0
    },

    freight: {
        type: Number,
        required: true,
        default: 0
    },

    addedBy:{
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: false
    },

    placedAt:{
        type: Date,
        default: Date.now,
        required: true
    }
});

const Parcel = mongoose.model('Parcel', parcelSchema);
module.exports = Parcel;