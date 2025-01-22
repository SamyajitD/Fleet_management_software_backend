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
        required: true
    },

    receiver: {
        type: Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },

    sourceWarehouse:{
        type: String,
        enum:['HYO', 'HYT', 'BHP', 'SEC'],
        required: false
    },

    destinationWarehouse:{
        type: String,
        enum:['MNC', 'KMR', 'STD', 'PLY', 'RMG', 'GDV'],
        required: false
    },

    status: {
        type: String,
        enum:['arrived', 'partial', 'delivered'],
        default: 'arrived',
        required: true
    },

    placedAt:{
        type: Date,
        default: Date.now,
        required: true
    }
});

const Parcel = mongoose.model('Parcel', parcelSchema);
module.exports = Parcel;