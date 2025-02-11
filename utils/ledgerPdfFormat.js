const formatToIST= require("../utils/dateFormatter.js");

const generateLedger = (ledger) => {
    console.log(ledger);
    let allParcels = ledger.parcels.map(parcel => `
        <tr>
            <td>${parcel.trackingId}</td>
            <td>${parcel.hamali}</td>
            <td>${parcel.freight}</td>
            <td>${parcel.receiver.name || 'NA'}</td>
        </tr>
    `).join('');

    let totalFreight = ledger.parcels.reduce((sum, parcel) => sum + parcel.freight, 0);
    let totalHamali = ledger.parcels.reduce((sum, parcel) => sum + parcel.hamali, 0);

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

                .totals {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid #333;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>FRIENDS TRANSPORT CORPORATION</h1>
                <p class="address">1651/2, Something, again something, Hyderabad</p>
                <h2>Ledger</h2>
            </div>

            <div class="ledger-header">
                <div><strong>Vehicle No:</strong> ${ledger.vehicleNo}</div>
                <div><strong>Delivery Station:</strong>${ledger.destinationWarehouse}</div>
                <div><strong>Date and Time:</strong> ${formatToIST(ledger.dispatchedAt)}</div>
            </div>

            <div class="table-container">
                <table style="font-size: 14px">
                    <thead>
                        <tr>
                            <th>Tracking ID</th>
                            <th>Hamali</th>
                            <th>Freight</th>
                            <th>Receiver</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allParcels}
                    </tbody>
                </table>
            </div>

            <div class="totals">
                <div>Total Freight: ${totalFreight}</div>
                <div>Total Hamali: ₹${totalHamali}</div>
            </div>
        </body>
        </html>
    `;
};

module.exports = generateLedger;