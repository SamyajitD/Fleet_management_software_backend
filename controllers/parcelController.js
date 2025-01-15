const Parcel = require("../models/parcelSchema.js");
const Client = require("../models/clientSchema.js");
const Item= require("../models/itemSchema.js");
const generateUniqueId= require("../utils/uniqueIdGenerator.js");

module.exports.newParcel = async(req, res)=>{
    try{
        const { items, senderDetails, receiverDetails } = req.body;

        const itemEntries = [];
        for (const item of items) {
            const newItem = new Item({
                name: item.name,
                description: item.description,
                quantity: item.quantity,
                itemId: generateUniqueId(14)
            });
            const savedItem = await newItem.save();
            itemEntries.push(savedItem._id);
        }

        const sender = new Client(senderDetails);
        const receiver = new Client(receiverDetails);

        const newSender = await sender.save();
        const newReceiver = await receiver.save();

        const trackingId= generateUniqueId(12);

        const newParcel = new Parcel({
            items: itemEntries,
            sender: newSender._id,
            receiver: newReceiver._id,
            trackingId
        });

        await newParcel.save();
        res.status(201).json({ message: "Parcel created successfully", parcel: newParcel });

    }catch(err){
        res.status(500).json({ message: "An error occurred while creating the parcel", error: err.message });
    }
};

module.exports.trackParcel= async(req, res)=>{
    try{
        const {id}= req.params;
        const parcel= await Parcel.find({trackingId: id}).populate('items');

        if(!parcel){
            res.json({message: `Can't find any Parcel with Tracking Id. ${id}`});
        }

        res.status(200).json({message: "Successfully fetched your parcel", parcel});

    }catch(err){
        res.status(500).json({ message: "An error occurred while tracking your parcel", error: err.message });
    }
}