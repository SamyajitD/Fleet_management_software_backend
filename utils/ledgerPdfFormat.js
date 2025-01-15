const generateLedger = (ledger) => {
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

    let allItems = ledger.items.map(item => `
        <tr>
            <td>${item.itemId}</td>
            <td>${item.name}</td>
            <td>${item.parcelId.sender.name}</td>
            <td>50</td>
            <td>₹15</td>
        </tr>
    `).join('');

    // const totalFreight = ledger.items.reduce((sum, item) => sum + item.freight, 0);
    // const totalHamali = ledger.items.reduce((sum, item) => sum + item.hamali, 0);

    const totalFreight= 1000;
    const totalHamali= 150;

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
                    color: #333;
                    font-size: 26px;
                    margin-bottom: 5px;
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
                <h1>FRIENDS TRANSPORTS CORPORATION</h1>
                <p class="address">1651/2, Something, again something, Hyderabad</p>
                <h2>Ledger</h2>
            </div>

            <div class="ledger-header">
                <div><strong>Vehicle No:</strong> ${ledger.vehicleNo}</div>
                <div><strong>Delivery Station:</strong>WAREHOUSE 2</div>
                <div><strong>Date and Time:</strong> ${formatToIST(ledger.dispatchedAt)}</div>
            </div>

            <div class="table-container">
                <table style="font-size: 14px">
                    <thead>
                        <tr>
                            <th>Item ID</th>
                            <th>Item Name</th>
                            <th>Consignee</th>
                            <th>Freight</th>
                            <th>Hamali</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allItems}
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