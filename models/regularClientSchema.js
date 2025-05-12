const mongoose= require("mongoose");

const regularClientchema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    phoneNo:{
        type: String,
        required: true
    },
    address:{
        type: String
    },
    gst:{
        type: String
    },
    items:[{
        itemDetails:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Item',
        },
        hamali:{
            type: Number,
        },
        freight:{
            type: Number,
        },
        statisticalCharges:{
            type: Number,
        }
    }]
});

module.exports= mongoose.model('RegularClient', regularClientchema);