const mongoose= require('mongoose');

const driverSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true
    },

    phoneNo:{
        type: String,
        required: true
    },

    vehicleNo:{
        type: String,
        required: true
    },

    liscenceNo:{
        type: String,
        required: true
    }
});

module.exports= mongoose.model('Driver', driverSchema);