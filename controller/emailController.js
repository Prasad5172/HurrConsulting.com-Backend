const dotenv = require("dotenv");
dotenv.config();
const sequilize = require("../config/db");
const bcryptjs = require("bcryptjs");
const otpGenerator = require("otp-generator");
var nodemailer = require("nodemailer");
const { QueryTypes } = require('sequelize');
const {emailService, userService}  = require("../service")
const {userRepository} = require("../repository")
const { responseHandler } = require("../helpers");


exports.sendOtp = async (req, res,next) => {
    const {email} = req.body;
    console.log("sendemail");
    const user = await userRepository.retrieveOne({email:email});
    if(!user){
        return res.status(400).json(responseHandler(false,400,"signup",null));
    }
    try {
         await emailService.sendOtpToEmail(req.body,user.user_id,(err,data) => {
            if(err){
                return res.status(err.code).json(err);
            }
            console.log(data)
            return res.status(200).json(data)
        });
    } catch (error) {
        console.log(error)
        return res
        .status(500)
        .json(responseHandler(true, 500, error, null));
    }
};

exports.sendContactData = async (req, res,next) => {
    
    console.log("senddata");
    try {
        await emailService.sendData(req.body, (err, data) => {
            if (err) {
                return res.status(err.code).json(err);
            }
            return res.status(200).json(data)
        })
    } catch (error) {
        console.log(error);
        return res
        .status(500)
        .json(responseHandler(true, 500, 'Server Error', null));
    }
};




