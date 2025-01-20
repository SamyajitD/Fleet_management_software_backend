const mongoose = require('mongoose');

const warehouseSchema= new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    address:{
        type: String,
        required: true
    },
    contactNo:{
        type: String,
        required: true
    },
    warehouseID:{
        type: String,
        required: true
    }
});

module.exports= mongoose.model('Warehouse', warehouseSchema);