const bcryptjs = require("bcryptjs")
const { OtpModel } = require("../model/otp.js")
const  otpRepository  = require("../repository/otpRepository.js")

const Otp = (model) => ({
    sms: model.sms,
    user_id: model.user_id,
})

const create = async (newUser) => {
    console.log("otpRepository create");
    const otpHash = await bcryptjs.hash(newUser.sms, 10);
    newUser.sms = otpHash;
    
    let otpInDb = await OtpModel.findOne({ where: { user_id: newUser.user_id } });
    console.log("otpInDb", otpInDb);

    const date = new Date();
    console.log(date);
    date.setMinutes(date.getMinutes() + 10);
    console.log("at otp create", date);

    if (otpInDb) {
        otpInDb.sms = otpHash;
        otpInDb.expires_in = date;
        return await otpInDb.save();
    } else {
        try {
            otpInDb = await OtpModel.create({
                sms: newUser.sms,
                user_id: newUser.user_id,
                expires_in: date
            });
            console.log(otpInDb.expires_in);
        } catch (error) {
            console.error("Error creating OTP:", error.message);
            throw new Error("Some error occurred while registering the user.");
        }
    }
};


const retriveOtp = async (id) => {
    return await otpRepository.retriveOtp(id);
}

module.exports = {create,retriveOtp}