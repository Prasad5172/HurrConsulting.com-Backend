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
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
    },
    payment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
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
