const bcryptjs = require("bcryptjs")
const { OtpModel } = require("../model")
const { otpRepository } = require("../repository")

const Otp = (model) => ({
    sms: model.sms,
    user_id: model.user_id,
    expires_in:model.expires_in
})

exports.create = async (newUser) => {
    console.log("otpRepository create")
    const otpHash = await bcryptjs.hash(newUser.sms, 10)
    newUser.sms = otpHash;
    var otpInDb = await OtpModel.findOne({ where : { user_id: newUser.user_id } })
    console.log("otpInDb" + otpInDb)
    if (otpInDb) {
        otpInDb.sms = otpHash
        const date = new Date();
        date.setMinutes(date.getMinutes() + 10);
        console.log("at otp create",date);
        otpInDb.expires_in = date;
        return await otpInDb.save()
    } else {
        otpInDb = await otpRepository.create(Otp(newUser)).catch((error) => {
            // console.log(error.message)
            throw new Error("some error ocurred while registering the user.")
        })
    }
}


exports.retriveOtp = async (id) => {
    return await otpRepository.retriveOtp(id);
}