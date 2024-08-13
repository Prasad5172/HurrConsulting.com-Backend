const { Sequelize, DataTypes } = require('sequelize');
const db = require("../config/db");

const PaymentModel = db.define("payment", {
    payment_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true, // Assuming payment_id is unique
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    amount: {
        type: DataTypes.FLOAT, // You may also use DataTypes.DECIMAL for precise monetary values
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    request_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: () => {
            // Return the current date in YYYY-MM-DD format
            return new Date().toISOString().split('T')[0];
        },
    },
    payment_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: null,
    },
}, {
    timestamps: false,
    indexes: [
        {
            unique: true,
            fields: ['payment_id']
        },
        {
            fields: ['email']
        }
    ]
});

module.exports = { PaymentModel };
