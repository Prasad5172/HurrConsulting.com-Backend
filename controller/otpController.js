const dotenv = require("dotenv");
dotenv.config();
const bcryptjs = require("bcryptjs");
const {UserModel} = require("../model/user.js");
const {OtpModel} = require("../model/otp.js");
const {  getJwtToken } = require('../helpers/jwt.js');
const { responseHandler } = require('../helpers/handler.js');


const verifyOtp = async (req,res,next) => {
    console.log("verifyOtp");
    const {email,otp} = req.body;
    // let user = await userRepository.retrieveOne({email:email})
    let user = await UserModel.findOne({
        where:{email:email},
        attributes:["user_id","email","first_name"],
        include:[
            {
                model:OtpModel,
                attributes:["user_id","sms","expires_in"],
                as:'otp'
            }
        ]
    });
    // console.log(user);
    if (!user || !user.otp) {
        return res.status(400).json("Invalid email or OTP");
    }
    // console.log(user.otp);
    const otpInDb = user.otp.sms;
    const curDate = new Date().getTime();
    const expiresIn = user.otp.expires_in;
    // console.log(expiresIn);
    // console.log(curDate);
    // Check if OTP has expired
    if ( curDate > expiresIn ) {
        return res.status(400).json("OTP has expired");
    }
    if (!otpInDb ) { return res.status(400).json("expired")}
    const validUser = await bcryptjs.compare(otp, otpInDb);
    // console.log("validUser",validUser);
    if ( validUser ){
        user.is_verified = true;
        user.save()
        const payload = {
            user: {
                user_id: user.user_id,
                email: user.email,
                is_admin:user.is_admin
            }
        }
        return getJwtToken(payload, "succesful",600, (err, data) => {
            if (err) {
                return res.status(err.code).json(err);
            }
            // console.log(user)
            // console.log(data);
            return res.status(200).json({ ...data, name: user.first_name, email: user.email,is_admin:user.is_admin })
        })
    }
    else {
        return res.status(400).json(responseHandler(false,400,"wrongOtp",null))
    }
}

module.exports = {verifyOtp}