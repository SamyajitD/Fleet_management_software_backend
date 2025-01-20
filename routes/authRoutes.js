const express= require("express");
const router= express.Router();
const passport= require('passport');
const authController= require("../controllers/authController.js");
const catchAsync= require("../utils/catchAsync.js");

router.route('/status')
    .get((req, res)=>{
        if(req.user){
            res.json({flag: true, user: req.user});
        }else{
            res.json({flag: false});
        }
    })

router.route('/login')
    .post(passport.authenticate('local', {failureMessage: true}), (req, res)=>{
        res.json({ message: 'Login Successful', body: {flag: true} });
    });

router.route('/register')
    .post(catchAsync(authController.register));

router.route('/get-all-usernames')
    .get(catchAsync(authController.fetchAllEmployees));

module.exports= router;