const bcryptjs = require("bcryptjs")
const { OtpModel } = require("../model/otp.js")
const userRepository = require("./userRepository")


// newuser ={email,sms}
const create = async (newUser) => {
    const expiresIn = new Date(Date.now() + 10 * 1000);
    return await OtpModel.create({...newUser,expires_in:expiresIn}).catch((error) => {
        console.log(error.message)
        throw new Error("some error ocurred while registering the otp.")
    })
}

// int id
const deleteOtpByUserId = async (id) => {
    await OtpModel.destory({ where: { user_id: id } });
};

const retriveOtp = async (id) => {
    return await OtpModel.findOne({where:{user_id:id}});
}

module.exports = {create,deleteOtpByUserId,retriveOtp} 