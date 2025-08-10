const formatToIST= require("../utils/dateFormatter.js");

const generateLedger = (ledger) => {
    console.log(ledger);
    let index = 1;
    let allParcels = ledger.parcels.map(parcel => {
        const totalCharges = (parcel.freight + parcel.hamali + parcel.charges) * parcel.items.reduce((sum, item) => sum + item.quantity, 0);
        return `
        <tr>
            <td>${index++}</td>
            <td>${parcel.trackingId}</td>
            <td>${parcel.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
            <td>${parcel.sourceWarehouse.name}</td>
            <td>${parcel.sender.name || 'NA'}</td>
            <td>${parcel.receiver.name || 'NA'}</td>
            <td>${parcel.payment}</td>
            <td>₹${parcel.hamali}</td>
            <td>₹${totalCharges}</td>
        </tr>
    `}).join('');

    let totalFreight = ledger.parcels.reduce((sum, parcel) => sum + parcel.freight, 0);
    let totalHamali = ledger.parcels.reduce((sum, parcel) => sum + parcel.hamali, 0);
    let totalCharges = ledger.parcels.reduce((sum, parcel) => sum + parcel.charges, 0);
    let totalItems = ledger.parcels.reduce((sum, parcel) => sum + parcel.items.length, 0);

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

                .ledger-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding: 0 10px;
                }

                .ledger-header div {
                    font-size: 14px;
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

                table th,
                table td {
                    padding: 8px;
                    text-align: left;
                    border: 1px solid #333;
                }

                table th {
                    background-color: #f5f5f5;
                    border: 1px solid #333;
                    border-collapse: collapse;
                }

                .totals {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid #333;
                    font-weight: bold;
                }

                #date-time{
                    font-size: 15px;
                    margin-left: 9px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>FRIENDS TRANSPORT COMPANY</h1>
                <p class="address">H.O: 15-1-196/2, Feelkhana, Hyd. Br. O : Nallagutta, Secunderabad. <br> Br. Off Near Mir Alam Filter, Bahadurpura, Hyderabad</p>
                <h2>MEMO</h2>
            </div>

            <div id="date-time"><strong>Date and Time:</strong> ${formatToIST(ledger.dispatchedAt)}</div>
            <br>

            <div class="ledger-header">
                <div><strong>Vehicle No: </strong>${ledger.vehicleNo}</div>
                <div><strong>Source Station: </strong>${ledger.sourceWarehouse.name}</div>
                <div><strong>Delivery Station: </strong>${ledger.destinationWarehouse.name}</div>
            </div>

            <div class="table-container">
                <table style="font-size: 14px">
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>LR No.</th>
                            <th>Qty</th>
                            <th>From</th>
                            <th>Sender</th>
                            <th>Receiver</th>
                            <th>LR Type</th>
                            <th>Hamali</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allParcels}
                        <tr style="font-weight: bold; background-color: #f5f5f5;">
                            <td colspan="2">Total</td>
                            <td>${totalItems}</td>
                            <td colspan="4"></td>
                            <td>₹${totalHamali}</td>
                            <td>₹${ledger.parcels.reduce((sum, parcel) => 
                                sum + ((parcel.freight + parcel.hamali + parcel.charges) * 
                                parcel.items.reduce((qty, item) => qty + item.quantity, 0)), 0)
                            }</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            </div>
            <br>
            <div style="margin: 20px 0;">
                <h3 style="font-size: 16px; margin-bottom: 10px;">Summary</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 0; text-align: center;">
                    <tr style="font-weight: bold;">
                        <td style="padding: 5px 15px;"></td>
                        <td style="padding: 5px 15px;">No. of LRs</td>
                        <td style="padding: 5px 15px;">Total Articles</td>
                        <td style="padding: 5px 15px;">Amount</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 15px;"></td>
                        <td style="padding: 5px 15px;">${ledger.parcels.length}</td>
                        <td style="padding: 5px 15px;">${totalItems}</td>
                        <td style="padding: 5px 15px;">₹${ledger.parcels.reduce((sum, parcel) => 
                            sum + ((parcel.freight + parcel.hamali + parcel.charges) * 
                            parcel.items.reduce((qty, item) => qty + item.quantity, 0)), 0)
                        }</td>
                    </tr>
                    <tr style="border-top: 1px solid #333; font-weight: bold;">
                        <td style="padding: 10px 15px;">Total</td>
                        <td style="padding: 10px 15px;">${ledger.parcels.length}</td>
                        <td style="padding: 10px 15px;">${totalItems}</td>
                        <td style="padding: 10px 15px;">₹${ledger.parcels.reduce((sum, parcel) => 
                            sum + ((parcel.freight + parcel.hamali + parcel.charges) * 
                            parcel.items.reduce((qty, item) => qty + item.quantity, 0)), 0)
                        }</td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
    `;
};

module.exports = generateLedger;