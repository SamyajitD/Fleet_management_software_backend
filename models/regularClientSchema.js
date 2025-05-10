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
});

module.exports= mongoose.model('RegularClient', regularClientchema);