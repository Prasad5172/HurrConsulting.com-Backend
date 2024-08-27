const { responseHandler } = require('../helpers/handler.js');
const utils = require('../utils/conditional.utils.js');
const { UserModel } = require("../model/user.js")
const { PaymentModel } = require("../model/Payment.js")



const create = async (newPayment) => {
    console.log("create payment")
    return await PaymentModel.create(newPayment).catch((error) => {
        console.log(error.message)
        throw new Error("some error ocurred while registering the user.")
    })
}

// params is object
const retrieveOne = async (params) => await PaymentModel.findOne({ where: params })
    

    


const retrieveAll = async (result) => {
    const queryResult = await PaymentModel.findAll({
        attributes: [
            'payment_id',
            'email',
            'amount',
            'status',
            'requested_date',
            'payment_date',
            'user_id'
        ]
    }).catch((error) => {
        console.log(error);
        return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });
    return result(null, responseHandler(true, 200, 'Success', queryResult));
}

module.exports = {create,retrieveAll,retrieveOne}
