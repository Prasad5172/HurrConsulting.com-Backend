const bcryptjs = require("bcryptjs")
const { OtpModel } = require("../model")
const userRepository = require("./userRepository")


// newuser ={email,sms}
exports.create = async (newUser) => {
    const expiresIn = new Date(Date.now() + 10 * 1000);
    return await OtpModel.create({...newUser,expires_in:expiresIn}).catch((error) => {
        console.log(error.message)
        throw new Error("some error ocurred while registering the otp.")
    })
}

// int id
exports.deleteOtpByUserId = async (id) => {
    await OtpModel.destory({ where: { user_id: id } });
};

exports.retriveOtp = async (id) => {
    return await OtpModel.findOne({where:{user_id:id}});
}

