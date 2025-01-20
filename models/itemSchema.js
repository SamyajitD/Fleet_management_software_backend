const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemId:{
        type: String,
        required: true,
        unique: true
    },

    //tracking id
    parcelId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parcel'
    },

    name: {
        type: String,
        required: true
    },

    quantity:{
        type: Number,
        required: true
    },

    dipatchedAt:{
        type: Date,
    },

    deliveredAt:{
        type: Date,
    },

    status:{
        type: String,
        enum: ['arrived', 'dispatched', 'delivered'],
        default: 'arrived',
        required: true
    }
});

module.exports = mongoose.model('Item', itemSchema);