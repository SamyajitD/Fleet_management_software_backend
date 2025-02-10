const Parcel = require('../models/parcelSchema.js');
const {sendDeliveredMessage} = require('../utils/whatsappMessageSender.js');

async function updateParcelStatus(trackingId) {
    const parcel = await Parcel.findOne({trackingId}).populate('items');
    if(!parcel) {
        return false;
    }

    let allArrived = true;
    let allDelivered = true;
    let isPartial = false;

    for(let item of parcel.items) {
        if(item.status !== 'arrived') {
            allArrived = false;
        }
        if(item.status !== 'delivered') {
            allDelivered = false;
        }
        if(['dispatched', 'arrived'].includes(item.status)) {
            isPartial = true;
        }
    }

    if(allDelivered) {
        parcel.status = 'delivered';
        await sendDeliveredMessage(parcel.sender.phoneNo, parcel.sender.name, parcel.trackingId);
        await sendDeliveredMessage(parcel.receiver.phoneNo, parcel.receiver.name, parcel.trackingId);
    } else if(allArrived) {
        parcel.status = 'arrived';
    } else if(isPartial) {
        parcel.status = 'partial';
    }

    await parcel.save();
    return true;
}

module.exports = {updateParcelStatus};