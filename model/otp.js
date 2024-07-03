const Sequelize = require("sequelize")
const db = require("../config/db")



const OtpModel = db.define("otp",{
    user_id:{
        type:Sequelize.INTEGER,
        autoIncrement: true,
        allowNull:false,
        primaryKey:true
    },
    sms:{
        type:Sequelize.STRING,
        allowNull:false   
   },
   expires_in: {
       type: Sequelize.DATE,
       allowNull: false,
   }
},{timestamps:false})

module.exports = {OtpModel}