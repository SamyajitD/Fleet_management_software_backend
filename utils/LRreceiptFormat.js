const formatToIST = require("../utils/dateFormatter.js");

const generateLR = (parcel, auto = 0) => {
    let index = 1;
    let allitems = parcel.items.map(item => {
        if (auto == 1) {
            return `
            <tr>
                <td>${index++}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
            </tr>
            `;
        } else {
            return `
            <tr>
                <td>${index++}</td>
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${item.freight == 0 ? "____" : `₹${item.freight}`}</td>
                <td>${item.hamali == 0 ? "____" : `₹${item.hamali}`}</td>
                <td>${item.statisticalCharges == 0 ? "____" : `₹${item.statisticalCharges}`}</td>
            </tr>
            `;
        }
    }).join('');

    let totalFreight = parcel.freight;
    let totalHamali = parcel.hamali;
    let totalCharges = parcel.charges;
    let totalItems = parcel.items.reduce((sum, item) => sum + item.quantity, 0);
    let totalAmount = totalFreight + totalHamali + totalCharges;

    let tableHeaders = '';
    let totalRow = '';
    
    if (auto == 1) {
        tableHeaders = `
            <tr>
                <th>S.No.</th>
                <th>Item</th>
                <th>Qty</th>
            </tr>
        `;
        totalRow = `
            <tr class="total-row">
                <td colspan="2">Total</td>
                <td>${totalItems}</td>
            </tr>
        `;
    } else {
        tableHeaders = `
            <tr>
                <th>S.No.</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Freight</th>
                <th>Hamali</th>
                <th>Statical</th>
            </tr>
        `;
        totalRow = `
            <tr class="total-row">
                <td colspan="2">Total</td>
                <td>${totalItems}</td>
                <td>${totalFreight === 0 ? "____" : `₹${totalFreight}`}</td>
                <td>${totalHamali === 0 ? "____" : `₹${totalHamali}`}</td>
                <td>${totalCharges === 0 ? "____" : `₹${totalCharges}`}</td>
            </tr>
        `;
    }

    return `
    <div class="lr-receipt">
        <div class="jurisdiction">SUBJECT TO HYDERABAD JURISDICTION</div>
        <div class="header">
            <h1>FRIENDS TRANSPORT CO</h1>
            <div class="address">H.O.: 15-1-196/2, Feelkhana, Hyd. Br. O.: Nallagutta, Secunderabad.</div>
            <div class="address">Br. Off. Near Mir Alam Filter, Bahadurpura, Hyd.</div>
            <div class="route">
                <span class="label">From:</span> <span class="value">${parcel.sourceWarehouse.name}</span>
                <span class="sep">→</span>
                <span class="label">To:</span> <span class="value">${parcel.destinationWarehouse.name}</span>
            </div>
            <div class="lr-header-row">
                <div class="date">Date: ${formatToIST(parcel.placedAt)}</div>
                <div class="lr-no">LR No: ${parcel.trackingId}</div>
                <div class="payment">${parcel.payment.toUpperCase()}</div>
            </div>
        </div>

        <div class="consignor-consignee">
            <div class="consignor">
                <span class="label">Consignor:</span>
                <span class="value">${parcel.sender.name}</span>
            </div>
            <div class="consignee">
                <span class="label">Consignee:</span>
                <span class="value">${parcel.receiver.name}</span>
            </div>
        </div>

        <table class="main-table ${auto == 1 ? 'auto-table' : 'normal-table'}">
            <thead>
                ${tableHeaders}
            </thead>
            <tbody>
                ${allitems}
                ${totalRow}
            </tbody>
        </table>

        <div class="meta">
            <span>Declared goods value ₹${parcel.declaredValue || "____"}</span>
            <span>Goods are at owner's risk</span>
            <span>GSTIN: 36AAFFF2744R12X</span>
        </div>
        <div class="branches">◆ Karimnagar-9908690827 ◆ Sultanabad-Ph: 9849701721 ◆ Peddapally-Cell: 7036323006 ◆ Ramagundam-Cell: 9866239010 ◆ Godavari Khani-Cell: 9949121267 ◆ Mancherial-Cell: 8977185376</div>
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
            size: 4in 6in;
            margin: 0;
        }
        body { width: 4in; height: 6in; margin: 0; padding: 1.5mm; font-family: Arial, sans-serif; font-size: 6px; }
        .sheet {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .lr-receipt {
            width: 100%;
            height: 100%;
            border: 1px dotted #000;
            padding: 2mm;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            page-break-after: always;
        }
        .jurisdiction {
            text-align: center;
            font-weight: bold;
            font-size: 7px;
            margin-bottom: 1mm;
        }
        .header {
            text-align: center;
            margin-bottom: 1mm;
        }
        .header h1 {
            margin: 0;
            padding: 0;
            font-size: 10px;
            font-weight: bold;
        }
        .address {
            font-size: 7px;
            margin: 0.5mm 0;
        }
        .route { display: flex; justify-content: center; gap: 2mm; font-size: 6px; margin: 0.5mm 0; }
        .route .sep { margin: 0 1mm; }
        .lr-header-row {
            display: flex;
            justify-content: space-between;
            font-size: 7px;
            margin: 1mm 0;
        }
        .consignor-consignee {
            display: flex;
            justify-content: space-between;
            font-size: 7px;
            margin: 1mm 0;
        }
        .label {
            font-weight: bold;
        }
        .main-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 6px;
            margin: 0.7mm 0;
            table-layout: fixed;
        }
        /* 6-column widths: S.No | Item | Qty | Freight | Hamali | Statical */
        .main-table thead tr th:nth-child(1), .main-table tbody tr td:nth-child(1) { width: 8%; }
        .main-table thead tr th:nth-child(2), .main-table tbody tr td:nth-child(2) { width: 42%; }
        .main-table thead tr th:nth-child(3), .main-table tbody tr td:nth-child(3) { width: 10%; }
        .main-table thead tr th:nth-child(4), .main-table tbody tr td:nth-child(4) { width: 13%; }
        .main-table thead tr th:nth-child(5), .main-table tbody tr td:nth-child(5) { width: 13%; }
        .main-table thead tr th:nth-child(6), .main-table tbody tr td:nth-child(6) { width: 14%; }
        /* 4-column widths for auto table: S.No | Item | Qty */
        .auto-table thead tr th:nth-child(1), .auto-table tbody tr td:nth-child(1) { width: 12%; }
        .auto-table thead tr th:nth-child(2), .auto-table tbody tr td:nth-child(2) { width: 68%; }
        .auto-table thead tr th:nth-child(3), .auto-table tbody tr td:nth-child(3) { width: 20%; }
        .main-table th, .main-table td {
            border: 1px solid #000;
            padding: 0.4mm;
            text-align: center;
        }
        .main-table th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        .total-row {
            font-weight: bold;
            background-color: #f0f0f0;
        }
        .meta { display: flex; align-items: center; justify-content: space-between; font-size: 6px; margin: 0.5mm 0; }
        .branches { font-size: 4px; text-align: center; line-height: 1.1; margin: 0.5mm 0; }
    </style>
</head>
<body>
    <div class="sheet">
        ${generateLR(parcel)}
        ${generateLR(parcel)}
        ${generateLR(parcel, 1)}
    </div>
</body>
</html>
    `;
};

module.exports = { generateLR, generateLRSheet };