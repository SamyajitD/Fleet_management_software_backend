const formatToIST = require("../utils/dateFormatter.js");

const generateLR = (parcel, auto = 0) => {
    let index = 1;
    let allitems = parcel.items.map(item => {
        if (auto == 1) {
            return `
            <tr>
                <td>${index++}</td>
                <td>${item.name}</td>  
                <td>${item.type}</td>
                <td>${item.quantity}</td>
            </tr>
            `;
        } else {
            const unitPrice = item.freight + item.hamali + item.statisticalCharges;
            const totalPrice = unitPrice * item.quantity;
            let totalCell = '';
            if (unitPrice === 0) {
                totalCell = '____';
            } else {
                totalCell = `₹${totalPrice} <span style="font-size: 8px; color: #666;">(₹${unitPrice} each)</span>`;
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
        }
    }).join('');

    let totalFreight = parcel.freight;
    let totalHamali = parcel.hamali;
    let totalCharges = parcel.charges;
    let totalItems = parcel.items.reduce((sum, item) => sum + item.quantity, 0);
    let totalAmount = totalFreight + totalHamali + totalCharges;

    let lastRow = '';
    if (auto == 0) {
        lastRow = `
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
    } else {
        lastRow = `
            <tr style=\"font-weight: bold; background: #f5f5f5;\">
                <td></td>
                <td></td>  
                <td>Total</td>
                <td>${totalItems}</td>
            </tr>
            `;
    }

    return `
            <div class="lr-receipt">
                <div class="content-wrapper">
                    <div class="jurisdiction">SUBJECT TO HYDERABAD JURISDICTION</div>
                    <div class="header">
                        <h1>FRIENDS TRANSPORT CO.</h1>
                        <p class="address">H.O: 15-1-196/2, Feelkhana, Hyd. Br. O : Nallagutta, Secunderabad.<br>Br. Off Near Mir Alam Filter, Bahadurpura, Hyderabad</p>
                        <div class="lr-header-row">
                            <span class="date-info"><span class="info-label">Date:</span> ${formatToIST(parcel.placedAt)}</span>
                            <h2>LR Receipt (${parcel.trackingId})</h2>
                            <span class="payment-info"><strong>${parcel.payment.toUpperCase()}</strong></span>
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
                            <div class="details-grid">
                                <span class="name-phone"><span class="info-label">Name:</span> ${parcel.sender.name} <span class="separator">|</span> <span class="info-label">Ph:</span> ${parcel.sender.phoneNo}</span>
                                <span class="gst-addr"><span class="info-label">GST:</span> ${parcel.sender.gst || "____"} <span class="separator">|</span> <span class="info-label">Addr:</span> <span class="small">${parcel.sender.address}</span></span>
                            </div>
                        </div>
                        <div class="info-block" style="text-align:right;">
                            <span class="section-title">Receiver Details</span><br>
                            <div class="details-grid text-right">
                                <span class="name-phone"><span class="info-label">Name:</span> ${parcel.receiver.name} <span class="separator">|</span> <span class="info-label">Ph:</span> ${parcel.receiver.phoneNo}</span>
                                <span class="gst-addr"><span class="info-label">GST:</span> ${parcel.receiver.gst || "____"} <span class="separator">|</span> <span class="info-label">Addr:</span> <span class="small">${parcel.receiver.address}</span></span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Items</div>
                    <div class="table-container">
                        <div class="table-scroll">
                            <table>
                                <thead>
                                    <tr>
                                        <th>S.No.</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Qty</th>
                                        ${auto == 0 ? '<th>Freight</th><th>Hamali</th><th>Stat.</th><th>Total</th>' : ''}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${allitems}
                                    ${lastRow}
                                </tbody>
                            </table>
                        </div>
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
            </div>
    `;
};

const generateLRSheet = (parcel) => {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>FTC LR Receipt</title>
            <style>
                @page {
                    size: A4;
                    margin: 0;
                }
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                }
                .sheet {
                    width: 210mm;
                    min-height: 297mm;
                    padding: 2mm;
                    margin: 0 auto;
                    background: white;
                    display: flex;
                    flex-direction: column;
                    gap: 2mm;
                }
                .lr-receipt {
                    width: 206mm;
                    height: 97mm;
                    padding: 2mm;
                    border: 1px solid #000;
                    position: relative;
                    box-sizing: border-box;
                    page-break-inside: avoid;
                    font-size: 12px;
                    display: flex;
                    flex-direction: column;
                }
                .lr-receipt::after {
                    content: '✂';
                    position: absolute;
                    bottom: -3.5mm;
                    left: -3mm;
                    font-size: 14px;
                    color: #000;
                    transform: rotate(0deg);
                }
                .lr-receipt::before {
                    content: '';
                    position: absolute;
                    bottom: -1mm;
                    left: 3mm;
                    right: 0;
                    height: 1mm;
                    border-bottom: 0.1mm dashed #000;
                }
                .lr-receipt:last-child::after,
                .lr-receipt:last-child::before {
                    display: none;
                }
                .content-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                .jurisdiction {
                    text-align: center;
                    font-size: 7px;
                    font-weight: bold;
                    margin-bottom: 2px;
                }
                .header {
                    text-align: center;
                    margin-bottom: 4px;
                }
                .header h1 {
                    margin: 0 0 1px 0;
                    font-size: 14px;
                }
                .header h2 {
                    margin: 0;
                    font-size: 13px;
                    flex: 1;
                    text-align: center;
                }
                .header .address {
                    margin: 1px 0 2px 0;
                    font-size: 8px;
                    line-height: 1.3;
                }
                .lr-header-row {
                    display: grid;
                    grid-template-columns: 140px 1fr 140px;
                    align-items: center;
                    margin-top: 1px;
                    width: 100%;
                }
                .date-info {
                    font-size: 9px;
                    justify-self: start;
                }
                .payment-info {
                    font-size: 9px;
                    justify-self: end;
                }
                .section {
                    border-top: 1px dashed #bbb;
                    margin-top: 1px;
                    padding-top: 1px;
                }
                .section:first-of-type {
                    border-top: none;
                    margin-top: 0;
                    padding-top: 0;
                }
                .section:last-child {
                    margin-top: 0;
                    border-top: none;
                }
                .section-title {
                    font-size: 8px;
                    margin-bottom: 1px;
                    font-weight: bold;
                    color: #444;
                }
                .info-row {
                    display: flex;
                    justify-content: space-between;
                    gap: 4px;
                    margin-bottom: 1px;
                    line-height: 1.1;
                }
                .top-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 4px;
                    font-size: 9px;
                    margin: 1px 0;
                }
                .info-block {
                    flex: 1;
                    font-size: 9px;
                }
                .info-label {
                    font-weight: bold;
                    color: #333;
                    margin-right: 1px;
                    display: inline-block;
                }
                .details-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 1px;
                    margin-bottom: 1px;
                    line-height: 1.2;
                }
                .name-phone {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .gst-addr {
                    display: inline-block;
                    line-height: 1.15;
                }
                .separator {
                    color: #666;
                    margin: 0 2px;
                    font-size: 8px;
                }
                .text-right {
                    text-align: right;
                }
                .text-right .gst-addr {
                    text-align: right;
                }
                .date-block {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    white-space: nowrap;
                }
                .fromto-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1px;
                    font-size: 9px;
                }
                .fromto-block {
                    flex: 1;
                }
                .fromto-label {
                    font-weight: bold;
                    color: #333;
                    min-width: 28px;
                    display: inline-block;
                    font-size: 9px;
                }
                .fromto-value {
                    font-size: 9px;
                }
                .table-container {
                    margin: 1px 0;
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                    max-height: 55mm;
                    overflow: hidden;
                }
                .table-scroll {
                    overflow: auto;
                    flex: 1;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 9px;
                    margin-bottom: 0;
                }
                th, td {
                    border: 1px solid #333;
                    padding: 1px 2px;
                    text-align: left;
                    height: 12px;
                    max-height: 12px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                th {
                    background: #eee;
                    font-size: 9px;
                    white-space: nowrap;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }
                tbody tr {
                    height: 12px;
                }
                .small {
                    font-size: 8px;
                }
                .section:last-child {
                    margin-top: 1px;
                    padding-top: 1px;
                    border-top: none;
                }
                @media print {
                    .sheet {
                        margin: 0;
                        padding: 5mm;
                        box-shadow: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class="sheet">
                ${generateLR(parcel, 0)}
                ${generateLR(parcel, 0)}
                ${generateLR(parcel, 1)}
            </div>
        </body>
        </html>
    `;
};

module.exports = { generateLR, generateLRSheet };