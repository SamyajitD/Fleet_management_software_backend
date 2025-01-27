const axios = require("axios");
const crypto = require('node:crypto');  

const otpStore = new Map();

function generateOTP() {
    return crypto.randomInt(0, 999999).toString().padStart(6, '0');   
}

async function storeOTP(phoneNo, otp) {
    otpStore.set(phoneNo, {
        otp,
        expires: Date.now() + 2 * 60 * 1000 // 2min
    });

    setTimeout(() => {
        otpStore.delete(phoneNo);
    }, 2 * 60 * 1000);
}

async function verifyOTP(phoneNo, userOtp) {
    const otpData = otpStore.get(phoneNo);
    if (!otpData) return false;
    
    if (Date.now() > otpData.expires) {
        otpStore.delete(phoneNo);
        return false;
    }

    const isValid = otpData.otp === userOtp;
    if (isValid) {
        otpStore.delete(phoneNo);
    }
    return isValid;
}

async function sendDeliveryMessage(phoneNo, name, trackingId){
    const respose= await axios({
        url: process.env.WHATSAPP_URL,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
        },
        data: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '+91 '+ phoneNo,
            type: 'template',
            template: {
                name: 'parcel_shipped',
                language: {
                    code: 'en_US'
                },
                components:[
                    {
                        type: 'body',
                        parameters:[
                            {
                                type: 'text',
                                text: name,
                            },
                            {
                                type: 'text',
                                text: trackingId,
                            }
                        ]
                    }
                ]
            }
        })
    })
    console.log(respose.data); 
    console.log({name, phoneNo, trackingId});
}

async function sendOTPMessage(phoneNo){
    const otp = generateOTP();
    storeOTP(phoneNo, otp);
    
    const respose = await axios({
        url: process.env.WHATSAPP_URL,
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`
        },
        data: JSON.stringify({
            messaging_product: 'whatsapp',
            to: '+91 '+ phoneNo,
            type: 'template',
            template: {
                name: 'otp',
                language: {
                    code: 'en_US'
                },
                // components:[
                //     {
                //         type: 'body',
                //         parameters:[
                //             {
                //                 type: 'text',
                //                 text: otp,
                //             },
                //         ]
                //     }
                // ]
            }
        })
    });
    console.log(respose.data);
    console.log(`OTP for ${phoneNo} is ${otp}`);
}

module.exports = {
    sendDeliveryMessage,
    sendOTPMessage,
    verifyOTP
};