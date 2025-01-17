const Item= require("../models/itemSchema.js")
const Parcel= require("../models/parcelSchema.js");
const generateQRCode= require("../utils/qrCodeGenerator.js");

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

module.exports.generateQR= async(req, res)=>{
    try{
        const {id}= req.params;
        const item= await Item.findOne({itemId: id});

        if(!item){
            return res.status(201).json({message: "Incorrect Item Id", body: {}});
        }

        const qrCode= await generateQRCode(id);
        return res.status(200).json({message: `Successfully generated QR code for Item Id: ${id}`, body: qrCode});
    }catch(err){
        return res.status(500).json({message: `Failed to generate QR Code for Item Id: ${id}`, body: {}});
    }
}