const mongoose= require("mongoose");

const regularItemSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

module.exports= mongoose.model('RegularItem', regularItemSchema);