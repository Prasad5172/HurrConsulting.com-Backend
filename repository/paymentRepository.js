const { responseHandler } = require('../helpers');
const utils = require('../utils');
const { UserModel, PaymentModel } = require("../model")



exports.create = async (newPayment) => {
    console.log("create payment")
    return await PaymentModel.create(newPayment).catch((error) => {
        console.log(error.message)
        throw new Error("some error ocurred while registering the user.")
    })
}

// params is object
exports.retrieveOne = async (params) => await UserModel.findOne({ where: params })
    

    


exports.retrieveAll = async (result) => {
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
    if (utils.conditional.isArrayEmpty(queryResult)) {
        return result(responseHandler(false, 404, 'There are no Payment Till now', null), null);
    }
    return result(null, responseHandler(true, 200, 'Success', queryResult));
}

