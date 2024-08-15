const { responseHandler } = require('../helpers');
const utils = require('../utils');
const { UserModel, PlaylistModel } = require("../model")



exports.create = async (newUser) => {
    console.log("create user")
    return await UserModel.create(newUser).catch((error) => {
        console.log(error.message)
        throw new Error("some error ocurred while registering the user.")
    })
}


exports.retrieveOne = async (params) => await UserModel.findOne({ where: params })
    
    
    



exports.retrieveAll = async (result) => {
    const queryResult = await UserModel.findAll({
        attributes: [
            'user_id',
            'first_name',
            'email',
            'is_admin'
        ]
    }).catch((error) => {
        console.log(error);
        return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });
    if (utils.conditional.isArrayEmpty(queryResult)) {
        return result(responseHandler(false, 404, 'There are no users', null), null);
    }
    return result(null, responseHandler(true, 200, 'Success', queryResult));
}

