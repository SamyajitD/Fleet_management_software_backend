const Item= require("../models/itemSchema.js")
const Parcel= require("../models/parcelSchema.js");

module.exports.getItemDetails= async(req, res)=>{
    try{
        const {id}= req.params;
        const item= await Item.findOne({itemId: id});

        if(!item){
            return res.status(201).json({ message: `No item found with item number ${id}` });
        }

        const parcel= await Parcel.findById(item.parcelId).populate('sender receiver');

        return res.status(200).json({
            message: "Successfully fetched item details",
            body:
            {
                item,
                clientDetails: {
                    sender: parcel.sender,
                    receiver: parcel.receiver
                }
            }
        });

    }catch(err){
        return res.status(500).json({ message: "Failed to fetch item details", error: err.message });
    }
}