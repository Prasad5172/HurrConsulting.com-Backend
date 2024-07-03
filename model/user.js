const { Sequelize, DataTypes } = require('sequelize');
const db = require("../config/db")

const UserModel = db.define("user", {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            len: [3, 255],
        },
        defaultValue:"Hiii"
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    is_admin:{
        type:Sequelize.BOOLEAN,
        defaultValue:false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue:null
    },
    image_url: {
        type: DataTypes.STRING,
    },
    is_verified: {
        type: Sequelize.BOOLEAN, // Assuming it's a boolean flag
        allowNull: false,
        defaultValue: false // Set a default value if needed
    },
    is_google_linked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    google_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true, // Assuming a Google ID is unique per user
    }

}, {
     timestamps: false,
     indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            unique: true,
            fields: ['google_id']
        }
    ]
});


module.exports = { UserModel }