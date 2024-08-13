const { OtpModel } = require("./otp");
const {UserModel} = require("./user");
const {PaymentModel} = require("./Payment");

UserModel.hasOne(OtpModel,{as:"otp",foreignKey:"user_id",onDelete:"CASCADE"})
OtpModel.belongsTo(UserModel, { foreignKey: 'user_id'})
// User has many Payments
UserModel.hasMany(PaymentModel, {as:"payment", foreignKey: 'user_id',onDelete:"CASCADE" });
PaymentModel.belongsTo(UserModel, { foreignKey: 'user_id' });

module.exports= {
    UserModel,
    OtpModel,
    PaymentModel
}