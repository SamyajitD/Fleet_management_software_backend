if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require("mongoose")
const cors = require('cors');
const Warehouse = require("./models/warehouseSchema.js");

const dbUrl = process.env.DB_URL;
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 8000;

const ExpressError = require('./utils/expressError.js');
const Employee = require("./models/employeeSchema.js");

const authRoutes = require("./routes/authRoutes.js");
const ledgerRoutes = require("./routes/ledgerRoutes.js");
const parcelRoutes = require("./routes/parcelRoutes.js");
const warehouseRoutes = require("./routes/warehouseRoutes.js")
const driverRoutes = require("./routes/driverRoutes.js");
const itemRoutes = require("./routes/itemRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");

mongoose.connect(dbUrl);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
    console.log("Database Connected");
});

const corsOptions = {
    origin: '*',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.post('/add-warehouse', async(req, res) => {
    const warehouses = req.body;
    for (let warehouse of warehouses) {
        const w = new Warehouse(warehouse);
        await w.save();
        // console.log(w);
    }
    res.send("SUCCESS");
})

app.use('/api/auth', authRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/parcel', parcelRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/item', itemRoutes);
app.use('/api/admin', adminRoutes);

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Someting went Wrong !';
    res.status(statusCode).json(err);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});