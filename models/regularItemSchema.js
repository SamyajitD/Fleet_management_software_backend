const mongoose= require("mongoose");

const regularItemSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type:{
        type: String,
        enum: ['C/B', 'G/B', 'Bundle'],
        required: true
    },
    freight:{
        type: Number,
        required: true,
        default: 0
    },
    hamali:{
        type: Number,
        required: true,
        default: 0
    }
});

module.exports= mongoose.model('RegularItem', regularItemSchema);