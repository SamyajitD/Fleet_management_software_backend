const qrCodeTemplate = (qrCodeURL, id, count, receiverInfo) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>QR CODES (${id})</title>
        <style>
            @page { 
                size: 50mm 50mm; 
                margin: 0;
            }
            body { 
                margin: 0;
                padding: 2mm;
            }
            .label {
                width: 46mm;
                height: 46mm;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .qr-code {
                width: 25mm;
                height: 25mm;
                margin-bottom: 1mm;
            }
            .tracking-id {
                font-weight: bold;
                font-size: 8pt;
                margin-bottom: 1mm;
            }
            .receiver-info {
                font-size: 6pt;
                text-align: center;
                line-height: 1.2;
            }
            .warehouse-info {
                font-size: 6pt;
                text-align: center;
                margin-top: 1mm;
            }
            .date-info {
                font-size: 6pt;
                text-align: center;
                margin-top: 1mm;
            }
        </style>
    </head>
    <body>
        ${Array.from({ length: count }, () => `
            <div class="label">
                <img src="${qrCodeURL}" class="qr-code" alt="QR Code">
                <div class="tracking-id">ID: ${id}</div>
                <div class="receiver-info">
                    ${receiverInfo.name}
                    <br>
                    <b>Ph:</b> ${receiverInfo.phone}
                </div>
                <div class="warehouse-info">
                    <b>From:</b> ${receiverInfo.source}
                    <br>
                    <b>To:</b> ${receiverInfo.destination}
                </div>
                <div class="date-info">
                    <b>Date: </b> ${receiverInfo.date}
                </div>
            </div>
        `).join('')}
    </body>
    </html>
    `
}

module.exports = qrCodeTemplate;