const formatToIST= require("../utils/dateFormatter.js");

const generateLR = (parcel) => {

    let allitems = parcel.items.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Friends Transport Company</title>
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
                }

                @page {
                    size: A4;
                    margin: 6mm;
                }

                @media print {
                    html, body {
                        width: 210mm;
                        height: max-content;
                        background: white;
                    }

                    thead {
                        display: table-header-group;
                    }
                }

                .header {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .header h1 {
                    font-size: 26px;
                    margin-bottom: 5px;
                }

                h2{
                    color: #333;
                }

                .address {
                    color: #666;
                    font-size: 14px;
                    margin-bottom: 10px;
                }

                .content {
                    display: flex;
                    gap: 15px;
                }

                .left-column {
                    flex: 3;
                    min-width: 0;
                }

                .right-column {
                    width: 220px;
                    flex: none;
                    padding: 8px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    font-size: 14px;
                    height: fit-content;
                    position: sticky;
                    top: 0;
                }

                .table-container {
                    width: 100%;
                    margin: 0 auto 20px;
                    border-radius: 8px;
                    overflow: hidden;
                    border: 1px solid #333;
                    break-inside: avoid-page;
                }

                table {
                    width: 100%;
                    border-collapse: separate;
                    border-spacing: 0;
                }

                tr {
                    break-inside: avoid;
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
                    break-inside: avoid;
                }

                .bottom-box {
                    margin-top: 30px;
                    padding: 15px 20px;
                    border-top: 2px solid #333;
                    background-color: white;
                    break-inside: avoid;
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

                .main-wrapper {
                    display: flex;
                    flex-direction: column;
                    min-height: 100%;
                }

                .bill-content {
                    flex: 1;
                    margin-bottom: 30px;
                }
            </style>
        </head>
        <body>
            <div class="main-wrapper">
                <div class="bill-content">
                    <div class="header">
                        <h1>FRIENDS TRANSPORT COMPANY</h1>
                        <p class="address">H.O: 15-1-196/2, Feelkhana, Hyd. Br. O : Nallagutta, Secunderabad. <br> Br. Off Near Mir Alam Filter, Bahadurpura, Hyderabad</p>
                        <h2>LR Receipt</h2>
                    </div>

                    <div class="content">
                        <div class="left-column">
                            <div>
                                <strong>Source:</strong> ${parcel.sourceWarehouse.name} 
                                <br> 
                                <strong>Destination:</strong> ${parcel.destinationWarehouse.name}
                            </div>
                            <br>
                            <p><strong>List of Item(s):</strong></p>
                            <div class="table-container">
                                <table style="font-size: 14px">
                                    <thead>
                                        <tr>
                                            <th>Item Name</th>
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
                                    <strong>Statistical Charges: </strong> ${parcel.charges==0?"____":`₹${parcel.charges}`}
                                </div>
                                <div>
                                    <strong>Signature: </strong> _________________
                                </div>
                                </div>

                                <div>
                                <strong>Hamali: </strong>${parcel.hamali==0?"____": `₹${parcel.hamali}`}
                                <br>
                                <strong>Freight: </strong>${parcel.freight==0?"____": `₹${parcel.freight}`}
                                <br><br>
                                <strong>Total Items: ${parcel.items.length}</strong>
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
                                Address: ${parcel.sender.address}
                            </div>

                            <hr>

                            <div class="details-section">
                                <strong>Receiver Details:</strong>
                                Name: ${parcel.receiver.name}<br>
                                Phone: ${parcel.receiver.phoneNo}<br>
                                Address: ${parcel.receiver.address}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bottom-box">
                    <p class="disclaimer">FTC is not responsible for leakage and breakage</p>
                    <p><strong>GSTID:</strong> 36AAFFF2744R1ZX</p>
                    <div class="locations">
                        <span class="location">▸ Karimnagar- 9908690827</span>
                        <span class="location">▸ Sultanabad- 9849701721</span>
                        <span class="location">▸ Peddapally- 7036323006</span>
                        <span class="location">▸ Ramagundam- 9866239010</span>
                        <span class="location">▸ Godavari Khani- 9949121267</span>
                        <span class="location">▸ Mancherial- 8341249132</span>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports= generateLR;