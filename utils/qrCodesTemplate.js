const qrCodeTemplate= (qrCodeURL, id)=>{
    return `
    <!DOCTYPE html>
            <html>
            <head>
                <title>QR CODES (${id})</title>
                <style>
                    @page { 
                        size: A4; 
                        margin: 5mm;
                    }
                    body { 
                        margin: 0;
                        padding: 0;
                    }
                    .page {
                        position: relative;
                        height: 287mm;
                        page-break-after: always;
                    }
                    .qr-container {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        grid-template-rows: repeat(3, 90mm);
                        position: relative;
                        z-index: 2;
                        padding: 5mm;
                    }
                    .qr-item {
                        text-align: center;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 90mm;
                    }
                    .qr-code {
                        width: 70mm;
                        height: 70mm;
                    }
                    .tracking-id {
                        margin-top: 0;
                        font-weight: bold;
                        font-size: 12pt;
                    }
                    .cut-lines {
                        position: absolute;
                        top: 5mm;
                        left: 5mm;
                        right: 5mm;
                        bottom: 5mm;
                        z-index: 1;
                    }
                    .vertical-line {
                        position: absolute;
                        border-left: 1px dashed #000;
                        height: 100%;
                        left: 50%;
                    }
                    .horizontal-line-1 {
                        position: absolute;
                        border-top: 1px dashed #000;
                        width: 100%;
                        top: 90mm;
                    }
                    .horizontal-line-2 {
                        position: absolute;
                        border-top: 1px dashed #000;
                        width: 100%;
                        top: 180mm;
                    }
                </style>
            </head>
            <body>
                ${Array.from({ length: Math.ceil(count / 6) }, (_, pageIndex) => `
                    <div class="page">
                        <div class="cut-lines">
                            <div class="vertical-line"></div>
                            ${(pageIndex * 6 + 2) <= count ? '<div class="horizontal-line-1"></div>' : ''}
                            ${(pageIndex * 6 + 4) <= count ? '<div class="horizontal-line-2"></div>' : ''}
                        </div>
                        <div class="qr-container">
                            ${Array.from({ length: Math.min(6, count - pageIndex * 6) }, () => `
                                <div class="qr-item">
                                    <img src="${qrCodeURL}" class="qr-code" alt="QR Code">
                                    <div class="tracking-id">${id}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </body>
            </html>
    `
}

module.exports= qrCodeTemplate;