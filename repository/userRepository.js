const { responseHandler } = require('../helpers/handler.js');
const utils = require('../utils/conditional.utils.js');
const { UserModel } = require("../model/user.js")



const create = async (newUser) => {
    console.log("create user")
    return await UserModel.create(newUser).catch((error) => {
        console.log(error.message)
        throw new Error("some error ocurred while registering the user.")
    })
}


const retrieveOne = async (params) => await UserModel.findOne({ where: params })
    
    
    
const getProfile = async (userId) => {
    console.log("getProfile")
    return await UserModel.findOne({ 
        where: {user_id:userId},
        attributes:["user_id","first_name","email","image_url",'is_admin']
     })
    .catch((error) => {
        console.log("getProfile in UserRepository")
        console.log('error: ', error);
        throw new Error('User not found');
    })

};


const retrieveAll = async (result) => {
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
    return result(null, responseHandler(true, 200, 'Success', queryResult));
}

module.exports = {create ,retrieveAll,retrieveOne,getProfile}