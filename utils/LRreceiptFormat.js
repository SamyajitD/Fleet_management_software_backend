const generateLR = (parcel) => {
    const formatToIST = (utcDate) => {
        const options = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'Asia/Kolkata'
        };

        return new Intl.DateTimeFormat('en-US', options).format(new Date(utcDate));
    };

    let allitems = parcel.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.description}</td>
            <td>${item.quantity}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>

        <head>
            <title>Friends Transport Corporation</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    padding: 20px;
                    min-height: 100vh;
                    position: relative;
                }

                @page {
                    size: A4;
                    margin: 0;
                }

                @media print {

                    html,
                    body {
                        width: 210mm;
                        height: 297mm;
                        background: white;
                    }

                    body {
                        padding: 6mm;
                    }

                    .page-container {
                        page-break-after: always;
                        min-height: 257mm;
                        position: relative;
                    }
                }

                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .header h1 {
                    color: #333;
                    font-size: 26px;
                    margin-bottom: 5px;
                }

                .address {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 10px;
                }

                .content {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 30px;
                }

                .left-column {
                    flex: 3;
                }

                .right-column {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    font-size: 14px;
                }

                .table-container {
                    width: 100%;
                    margin: 0 auto;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid #333;
                }

                table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }

                table th,
                table td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #333;
                    border-right: 1px solid #333;
                }

                table th:last-child,
                table td:last-child {
                    border-right: none;
                }

                table tr:last-child td {
                    border-bottom: none;
                }

                table th {
                    background-color: #f5f5f5;
                }

                .details-section {
                    margin-bottom: 12px;
                }

                .details-section strong {
                    color: #333;
                    display: block;
                    margin-bottom: 3px;
                }

                hr {
                    border: none;
                    border-top: 1px solid #ccc;
                    margin: 8px 0;
                }

                .charges-row {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                    padding-top: 10px;
                    border-top: 1px solid #ccc;
                }

                .bottom-box {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 15px 20px;
                    border-top: 2px solid #333;
                    background-color: white;
                }

                .locations {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin-top: 10px;
                }

                .location {
                    font-size: 14px;
                    color: #444;
                }

                .disclaimer {
                    font-style: italic;
                    color: #666;
                    margin-bottom: 10px;
                }
            </style>
        </head>

        <body>
            <div class="page-container">
                <div class="header">
                    <h1>FRIENDS TRANSPORTS CORPORATION</h1>
                    <p class="address">1651/2, Something, again something, Hyderabad</p>
                    <h2>LR Receipt</h2>
                </div>

                <div class="content">
                    <div class="left-column">
                        <p><strong>List of Item(s):</strong></p>
                        <div class="table-container">
                            <table style="font-size: 14px">
                                <thead>
                                    <tr>
                                        <th>Item Name</th>
                                        <th>Description</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${allitems}
                                </tbody>
                            </table>
                        </div>

                        <div class="charges-row">
                            <div>
                                <strong>Charges:</strong> ₹1000
                            </div>
                            <div>
                                <strong>Signature:</strong> _________________
                            </div>
                        </div>
                    </div>

                    <div class="right-column">
                        <div class="details-section">
                            <strong>Tracking ID: ${parcel.trackingId}<br></strong>
                            <strong>Date: ${formatToIST(parcel.placedAt)} </strong>
                        </div>

                        <hr>

                        <div class="details-section">
                            <strong>Sender Details:</strong>
                            Name: ${parcel.sender.name}<br>
                            Phone: ${parcel.sender.phoneNo}<br>
                            Email: ${parcel.sender.email}
                        </div>

                        <hr>

                        <div class="details-section">
                            <strong>Receiver Details:</strong>
                            Name: ${parcel.receiver.name}<br>
                            Phone: ${parcel.receiver.phoneNo}<br>
                            Email: ${parcel.receiver.email}<br>
                            Address: ${parcel.receiver.address}
                        </div>
                    </div>
                </div>

                <div class="bottom-box">
                    <p class="disclaimer">FTC is not responsible for leakage and breakage</p>
                    <p><strong>GSTID:</strong> 36AAFFF2744R1ZX</p>
                    <div class="locations">
                        <span class="location">▸ Karimnagar- 9908690827</span>
                        <span class="location">▸ Sultanabad- 9849701721</span>
                        <span class="location">▸ Hyderabad- 9876543210</span>
                        <span class="location">▸ Warangal- 9123456789</span>
                        <span class="location">▸ Secunderabad- 9876543211</span>
                        <span class="location">▸ Khammam- 9876543212</span>
                    </div>
                </div>
            </div>
        </body>

        </html>
    `;
};

module.exports= generateLR;