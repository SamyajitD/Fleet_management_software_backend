const formatToIST = require('../utils/dateFormatter.js')

const generateLedger = (ledger, driver) => {
    console.log(ledger)
    let index = 1
    let allParcels = ledger.parcels
        .map(parcel => {
            return `
        <tr>
            <td>${index++}</td>
            <td>${parcel.trackingId}</td>
            <td>${parcel.items.reduce(
                (sum, item) => sum + item.quantity,
                0
            )}</td>
            <td>${parcel.receiver.name || 'NA'}</td>
            <td>₹${parcel.freight}</td>
            <td>₹${parcel.hamali}</td>
        </tr>
    `
        })
        .join('');

    let details =
        driver ? 
            `
            <div class="ledger-header">
                <div><strong>Vehicle No: </strong>${driver.vehicleNo}</div>
                <div><strong>Driver Name: </strong>${driver.name}</div>
                <div><strong>Driver Phone: </strong>${driver.phoneNo}</div>
            </div>
            <div class="ledger-header" style="margin-top: -10px">
                <div><strong>Source Station: </strong>${ledger.sourceWarehouse.name}</div>
                <div><strong>Delivery Station: </strong>${ledger.destinationWarehouse.name}</div>
            </div>
            ` : 
            `<div class="ledger-header">
                <div><strong>Vehicle No: </strong>${ledger.vehicleNo}</div>
                <div><strong>Source Station: </strong>${ledger.sourceWarehouse.name}</div>
                <div><strong>Delivery Station: </strong>${ledger.destinationWarehouse.name}</div>
            </div>` ;

    let totalFreight = ledger.parcels.reduce(
        (sum, parcel) => sum + parcel.freight,
        0
    )
    let totalHamali = ledger.parcels.reduce(
        (sum, parcel) => sum + parcel.hamali,
        0
    )
    let totalItems = ledger.parcels.reduce(
        (sum, parcel) =>
            sum + parcel.items.reduce((qty, item) => qty + item.quantity, 0),
        0
    )

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
                    line-height: 1.4;
                    padding: 10px;
                }

                @page {
                    size: A4;
                    margin: 4mm;
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
                    margin-bottom: 15px;
                }

                .header h1 {
                    font-size: 22px;
                    margin-bottom: 3px;
                }

                h2{
                    color: #333;
                    font-size: 18px;
                }

                .address {
                    color: #666;
                    font-size: 12px;
                    margin-bottom: 8px;
                }

                .ledger-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding: 0 8px;
                }

                .ledger-header div {
                    font-size: 12px;
                }

                .table-container {
                    width: 100%;
                    margin: 0 auto 15px;
                    border-radius: 6px;
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
                    padding: 5px;
                    text-align: left;
                    border: 1px solid #333;
                    font-size: 11px;
                }

                table th {
                    background-color: #f5f5f5;
                    border: 1px solid #333;
                    border-collapse: collapse;
                    font-size: 12px;
                }

                .totals {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid #333;
                    font-weight: bold;
                }

                #date-time{
                    font-size: 13px;
                    margin-left: 6px;
                    margin-bottom: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>FRIENDS TRANSPORT COMPANY</h1>
                <h2>MEMO</h2>
            </div>

            <div id="date-time">
                <span><strong>Date and Time:</strong> ${formatToIST(
        ledger.dispatchedAt
    )}</span>
                <span><strong>Memo No:</strong> ${ledger.ledgerId}</span>
                <span><strong>Lorry Freight:</strong> ₹${ledger.lorryFreight
        }</span>
            </div>

            ${details}

            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>S.No.</th>
                            <th>LR No.</th>
                            <th>Pkgs (Qty)</th>
                            <th>Consignee (Receiver)</th>
                            <th>Freight</th>
                            <th>Hamali</th>
                        </tr>
                    </thead>
                    <tbody>
                        
                        ${allParcels}
                          <tr style="font-weight: bold; background-color: #f5f5f5;">
                            <td colspan="2">Total</td>
                            <td>${totalItems}</td>
                            <td></td>
                            <td>₹${totalFreight}</td>
                            <td>₹${totalHamali}</td>
                        </tr>

                    </tbody>
                </table>
            </div>

            <div style="margin: 15px 0;">
                <h3 style="font-size: 14px; margin-bottom: 8px;">Summary</h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 0; text-align: center;">
                    <tr style="font-weight: bold;">
                        <td style="padding: 4px 12px;"></td>
                        <td style="padding: 4px 12px;">No. of LRs</td>
                        <td style="padding: 4px 12px;">Total Articles</td>
                        <td style="padding: 4px 12px;">Amount</td>
                    </tr>
                    <tr style="border-top: 1px solid #333; font-weight: bold;">
                        <td style="padding: 8px 12px;">Total</td>
                        <td style="padding: 8px 12px;">${ledger.parcels.length
        }</td>
                        <td style="padding: 8px 12px;">${totalItems}</td>
                        <td style="padding: 8px 12px;">₹${totalFreight + totalHamali
        }</td>
                    </tr>
                </table>
            </div>
            <div style="text-align: right; display: absolute; bottom: 0;">Created by: ${ledger.verifiedBySource.name}</div>
        </body>
        </html>
    `
}

module.exports = generateLedger
