const formatToIST= require("../utils/dateFormatter.js");

const generateLR = (parcel) => {
    let index = 1;
    let allitems = parcel.items.map(item => `
        <tr>
            <td>${index++}</td>
            <td>${item.name}</td>  
            <td>${item.type}</td>
            <td>${item.quantity}</td>
            <td>${item.freight==0?"____":`₹${item.freight}`}</td>
            <td>${item.hamali==0?"____":`₹${item.hamali}`}</td>
            <td>${item.statisticalCharges==0?"____":`₹${item.statisticalCharges}`}</td>
            <td>${item.freight+item.hamali+item.statisticalCharges==0?"____":`₹${(item.freight+item.hamali+item.statisticalCharges)*item.quantity}`}</td>
        </tr>
    `).join('');

    let totalFreight = parcel.freight;
    let totalHamali = parcel.hamali;
    let totalCharges = parcel.charges;
    let totalItems = parcel.items.reduce((sum, item) => sum + item.quantity, 0);
    let totalAmount = totalFreight + totalHamali + totalCharges;

    let lastRow= `
        <tr style="background-color: #f5f5f5; font-weight: bold;">
            <td></td>
            <td></td>  
            <td></td>
            <td>${totalItems}</td>
            <td>${totalFreight===0?"____":'₹'+totalFreight}</td>
            <td>${totalHamali===0?"____":'₹'+totalHamali}</td>
            <td>${totalCharges===0?"____":'₹'+totalCharges}</td></td>
            <td>${totalAmount===0?"____":'₹'+totalAmount}</td>
        </tr>
        `

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
                        min-height: 100%;
                        background: white;
                        margin: 0;
                        padding: 20px;
                    }

                    .main-wrapper {
                        display: flex;
                        flex-direction: column;
                        min-height: 100%;
                        position: relative;
                    }

                    .bill-content {
                        flex: 1 0 auto;
                    }

                    .bottom-box {
                        position: relative;
                        margin-top: auto;
                        page-break-inside: avoid;
                    }

                    thead {
                        display: table-header-group;
                    }
                }

                .main-wrapper {
                    display: flex;
                    flex-direction: column;
                    min-height: 100%;
                }

                .bill-content {
                    flex: 1 0 auto;
                }

                .bottom-box {
                    width: 100%;
                    padding: 15px 20px;
                    border-top: 1px solid #333;
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
                    width: 205px;h3
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
                    overflow: hidden;
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

                table thead tr th:first-child {
                    border-top-left-radius: 8px;
                }

                table thead tr th:last-child {
                    border-top-right-radius: 8px;
                }

                table tbody tr:last-child td:first-child {
                    border-bottom-left-radius: 8px;
                }

                table tbody tr:last-child td:last-child {
                    border-bottom-right-radius: 8px;
                }

                table th:not(:last-child),
                table td:not(:last-child) {
                    border-right: 1px solid #333;
                }

                .totals-section {
                    margin-top: 20px;
                }

                tr {
                    break-inside: avoid;
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
                    border-top: 1px solid #333;
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
            <div class="main-wrapper">
                <div class="bill-content">
                    <div class="header">
                        <h3>SUBJECT TO HYDERABAD JURISDICTION</h3>
                        <h1>FRIENDS TRANSPORT COMPANY</h1>
                        <p class="address">H.O: 15-1-196/2, Feelkhana, Hyd. Br. O : Nallagutta, Secunderabad. <br> Br. Off Near Mir Alam Filter, Bahadurpura, Hyderabad</p>
                        <h2>LR Receipt</h2>
                    </div>

                    <div class="content">
                        <div class="left-column">
                            <div> 
                                <strong>Created By:</strong> ${parcel.addedBy.name} 
                                <br><br> 
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
                                            <th>S.No.</th>
                                            <th>Item Name</th>
                                            <th>Type</th>
                                            <th>Quantity</th>
                                            <th>Freight</th>
                                            <th>Hamali</th>
                                            <th>Statistical Charges</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${allitems}
                                        ${lastRow}
                                    </tbody>
                                </table>
                            </div>

                            <div class="charges-row">
                                <div>
                                    <strong>Total Hamali: </strong>${totalHamali==0?"____": `₹${totalHamali}`}
                                </div>
                                <div>
                                    <strong>Signature: </strong> _______________
                                </div>
                            </div>
                                
                            <div>
                                <strong>Total Freight: </strong>${totalFreight==0?"____": `₹${totalFreight}`}
                                <br>
                                <strong>Total Statistical Charges: </strong> ${totalCharges==0?"____":`₹${totalCharges}`}
                                <br> <br>
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
                                Address: ${parcel.sender.address} <br>
                                GST: ${parcel.sender.gst}
                            </div>

                            <hr>

                            <div class="details-section">
                                <strong>Receiver Details:</strong>
                                Name: ${parcel.receiver.name}<br>
                                Phone: ${parcel.receiver.phoneNo}<br>
                                Address: ${parcel.receiver.address} <br>
                                GST: ${parcel.receiver.gst}
                            </div>
                        </div>
                    </div>
                </div>

                <hr>
                <br>

                 <div style="display: flex; justify-content: space-between; width: 95%;">
                    <strong style="margin-right: -25px">Total Items: </strong>${totalItems}
                    <strong style="margin-left: 140px; margin-right: -25px">Total Amount:</strong>${totalAmount==0?"____": `₹${totalAmount}`}
                    <strong style="margin-left: 140px; margin-right: -25px">Payment:</strong>${parcel.payment}
                </div>
                <div style="display: flex; width: 95%;">
                    <strong style="margin-right: 5px">Total Packages: </strong> ${parcel.items.length}
                    <strong style="margin-left: ${totalItems>=100?'140px':'147px'}; margin-right: 5px">Door Delivery: </strong> ${parcel.doorDelivery?"YES":"NO"}
                </div>
                <br>

                <div class="bottom-box">
                    <p class="disclaimer">FTC is not responsible for leakage and breakage</p>
                    <p><strong>FTC GST ID:</strong> 36AAFFF2744R1ZX</p>
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