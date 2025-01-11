if(process.env.NODE_ENV !== 'production'){
  require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const mongoose= require("mongoose")
const session= require('express-session');
const passport= require('passport');
const LocalStrategy= require('passport-local');
const MongoDBStore= require("connect-mongo");
const cors = require('cors');

const dbUrl= process.env.DB_URL;
const secret= process.env.SECRET;
const PORT = process.env.PORT || 8000;

const ExpressError= require('./utils/expressError.js');

const Employee= require("./models/employeeSchema.js");
const authRoutes= require("./routes/authRoutes.js");
const parcelRoutes= require("./routes/parcelRoutes.js");
const warehouseRoutes= require("./routes/warehouseRoutes.js")
const driverRoutes= require("./routes/driverRoutes.js");

mongoose.connect(dbUrl);
const db= mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", ()=>{
    console.log("Database Connected");
});
app.use(express.urlencoded({extended: true}));

const store = new MongoDBStore({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24*60*60
});

store.on('error', function(err){
  console.log("Error!", err);
})

const sessionConfig= {
  store,
  name: 'FTC',
  httpOnly: true,
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
      expires: Date.now() + (1000*60*60*24*30), //30days
      maxAge: (1000*60*60*24*30)
  }
}

const corsOptions= {
  origin: '*',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}

app.use(express.json());
app.use(session(sessionConfig));
app.use(cors(corsOptions));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(Employee.serializeUser());
passport.deserializeUser(Employee.deserializeUser());

passport.use(new LocalStrategy(Employee.authenticate()));

// app.get('/api/vehicles', async(req, res)=>{
//   try{
//     const drivers= (await Driver.find()).name;
//     res.json(drivers);
//   }catch(err){
//     res.json(err);
//   }
// })

app.use('/api/auth', authRoutes);
app.use('/api/parcel', parcelRoutes);
app.use('/api/warehouse', warehouseRoutes);
app.use('/api/driver', driverRoutes);

app.all('*', (req, res, next)=>{
  next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next)=>{
  const {statusCode=500}= err;
  if(!err.message) err.message='Someting went Wrong !';
  res.status(statusCode).json(err);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});