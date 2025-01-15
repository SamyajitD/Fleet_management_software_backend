const QRCode = require('qrcode');

const generateQRCode = async (id) => {
  try {
    const qrCodeURL = await QRCode.toDataURL(id, { type: 'image/png', width: 200 });
    return {qrCodeURL, id};
  } catch (err) {
    throw new Error(`Failed to generate QR Code: ${err.message}`);
  }
};

module.exports= generateQRCode;