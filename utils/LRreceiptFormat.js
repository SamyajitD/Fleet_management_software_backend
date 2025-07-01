const formatToIST = require("../utils/dateFormatter.js");

const generateLR = (parcel) => {
    let index = 1;
    let allitems = parcel.items.map(item => {
        const unitPrice = item.freight + item.hamali + item.statisticalCharges;
        const totalPrice = unitPrice * item.quantity;
        let totalCell = '';
        if (unitPrice === 0) {
            totalCell = '____';
        } else {
            totalCell = `₹${totalPrice} <br><span style=\"font-size:7px; color:#555;\">(₹${unitPrice} each)</span>`;
        }
        return `
        <tr>
            <td>${index++}</td>
            <td>${item.name}</td>  
            <td>${item.type}</td>
            <td>${item.quantity}</td>
            <td>${item.freight == 0 ? "____" : `₹${item.freight}`}</td>
            <td>${item.hamali == 0 ? "____" : `₹${item.hamali}`}</td>
            <td>${item.statisticalCharges == 0 ? "____" : `₹${item.statisticalCharges}`}</td>
            <td>${totalCell}</td>
        </tr>
        `;
    }).join('');

    let totalFreight = parcel.freight;
    let totalHamali = parcel.hamali;
    let totalCharges = parcel.charges;
    let totalItems = parcel.items.reduce((sum, item) => sum + item.quantity, 0);
    let totalAmount = totalFreight + totalHamali + totalCharges;

    let lastRow = `
        <tr style=\"font-weight: bold; background: #f5f5f5;\">
            <td></td>
            <td></td>  
            <td></td>
            <td>${totalItems}</td>
            <td>${totalFreight === 0 ? "____" : '₹' + totalFreight}</td>
            <td>${totalHamali === 0 ? "____" : '₹' + totalHamali}</td>
            <td>${totalCharges === 0 ? "____" : '₹' + totalCharges}</td>
            <td>${totalAmount === 0 ? "____" : '₹' + totalAmount}</td>
        </tr>
        `;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>FTC LR Receipt</title>
            <style>
                html, body {
                    width: 7cm;
                    min-width: 7cm;
                    max-width: 7cm;
                    height: 9.9cm;
                    min-height: 9.9cm;
                    max-height: 9.9cm;
                    font-family: Arial, sans-serif;
                    font-size: 7px;
                    margin: 0;
                    padding: 0;
                    background: #fff;
                }
                @page {
                    size: 7cm 9.9cm;
                    margin: 2mm;
                }
                @media print {
                    html, body {
                        width: 7cm !important;
                        min-width: 7cm !important;
                        max-width: 7cm !important;
                        height: 9.9cm !important;
                        min-height: 9.9cm !important;
                        max-height: 9.9cm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        font-size: 7px !important;
                    }
                    .main-wrapper {
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
                .main-wrapper {
                    padding: 7px 7px 5px 7px;
                    border: 1px solid #aaa;
                    border-radius: 5px;
                    box-shadow: 0 1px 4px #ccc;
                    background: #fff;
                    width: 7cm;
                    min-height: 9.9cm;
                    max-width: 7cm;
                    max-height: 9.9cm;
                    font-size: 7px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 6px;
                    font-size: 7px;
                }
                .header h1, .header h2 {
                    font-size: 7px;
                    margin-bottom: 1px;
                }
                .jurisdiction {
                    text-align: center;
                    font-size: 7px;
                    font-weight: bold;
                    margin-bottom: 3px;
                    letter-spacing: 0.5px;
                }
                .section {
                    border-top: 1px dashed #bbb;
                    margin-top: 7px;
                    padding-top: 5px;
                    font-size: 7px;
                }
                .section:first-of-type {
                    border-top: none;
                    margin-top: 0;
                    padding-top: 0;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 4px;
                    gap: 10px;
                    font-size: 7px;
                }
                .info-block {
                    flex: 1;
                    min-width: 0;
                    font-size: 7px;
                    padding: 1px 0 1px 0;
                    line-height: 1.1;
                }
                .info-label {
                    font-weight: bold;
                    color: #333;
                    min-width: 32px;
                    margin-right: 2px;
                    display: inline-block;
                    font-size: 7px;
                }
                .date-row { display: flex; align-items: center; gap: 2px; font-size: 7px; }
                .date-value { white-space: nowrap; display: inline-block; font-size: 7px; }
                .section-title {
                    font-size: 7px;
                }
                .fromto-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 7px;
                    margin-bottom: 2px;
                    padding-left: 2px;
                }
                .fromto-block {
                    flex: 1;
                }
                .fromto-label {
                    font-weight: bold;
                    color: #333;
                    min-width: 28px;
                    display: inline-block;
                    font-size: 7px;
                }
                .fromto-value {
                    font-weight: normal;
                    color: #222;
                    font-size: 7px;
                }
                .table-container {
                    margin: 4px 0 4px 0;
                    font-size: 7px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 7px;
                }
                th, td {
                    border: 1px solid #333;
                    padding: 1.5px 2px;
                    text-align: left;
                    font-size: 7px;
                }
                th {
                    background: #eee;
                }
                .totals-row td {
                    font-weight: bold;
                    background: #f5f5f5;
                    font-size: 7px;
                }
                .small {
                    font-size: 7px;
                }
            </style>
        </head>
        <body>
            <div class="main-wrapper">
                <div class="jurisdiction">SUBJECT TO HYDERABAD JURISDICTION</div>
                <div class="header">
                    <h1>FRIENDS TRANSPORT CO.</h1>
                    <h2>LR Receipt</h2>
                </div>
                <div class="section">
                    <div class="info-row">
                        <div class="info-block">
                            <span class="info-label">LR Number:</span> ${parcel.trackingId}<br>
                            <span class="date-row"><span class="info-label">Date:</span> <span class="date-value">${formatToIST(parcel.placedAt)}</span></span>
                        </div>
                        <div class="info-block" style="text-align:right;">
                            <span class="info-label">Payment:</span> ${parcel.payment}
                        </div>
                    </div>
                </div>
                <div class="section">
                    <div class="fromto-row">
                        <div class="fromto-block">
                            <span class="fromto-label">From:</span> <span class="fromto-value">${parcel.sourceWarehouse.name}</span>
                        </div>
                        <div class="fromto-block" style="text-align:right;">
                            <span class="fromto-label">To:</span> <span class="fromto-value">${parcel.destinationWarehouse.name}</span>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <div class="info-row">
                        <div class="info-block">
                            <span class="section-title">Sender Details</span><br>
                            <span class="info-label">Name:</span> ${parcel.sender.name}<br>
                            <span class="info-label">Phone:</span> ${parcel.sender.phoneNo}<br>
                            <span class="info-label">GST:</span> ${parcel.sender.gst || "____"}<br>
                            <span class="info-label">Address:</span> <span class="small">${parcel.sender.address}</span>
                        </div>
                        <div class="info-block" style="text-align:right;">
                            <span class="section-title">Receiver Details</span><br>
                            <span class="info-label">Name:</span> ${parcel.receiver.name}<br>
                            <span class="info-label">Phone:</span> ${parcel.receiver.phoneNo}<br>
                            <span class="info-label">GST:</span> ${parcel.receiver.gst || "____"}<br>
                            <span class="info-label">Address:</span> <span class="small">${parcel.receiver.address}</span>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Items</div>
                    <div class="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>S.No.</th>
                                    <th>Name</th>
                                    <th>Type</th>
                                    <th>Qty</th>
                                    <th>Freight</th>
                                    <th>Hamali</th>
                                    <th>Stat.</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allitems}
                                ${lastRow}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="section">
                    <div class="info-row">
                        <div class="info-block">
                            <span class="info-label">Door Delivery:</span> ${parcel.doorDelivery ? "YES" : "NO"}
                        </div>
                        <div class="info-block" style="text-align:right;">
                            <span class="info-label">Created By:</span> ${parcel.addedBy.name}
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = generateLR;