const Parcel= require("../models/parcelSchema.js");

module.exports.getAllItems= async(req, res)=>{
    try{
        const allItems= await Parcel.find().populate('items sender receiver');
        res.json(allItems);
    }catch(err){
        return res.json({"error": err});
    }
}