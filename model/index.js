const { OtpModel } = require("./otp")
const {UserModel} = require("./user")


UserModel.hasOne(OtpModel,{as:"otp",foreignKey:"user_id",onDelete:"CASCADE"})
OtpModel.belongsTo(UserModel, { foreignKey: 'user_id'})

module.exports= {
    UserModel,
    OtpModel
}