const Sequelize = require('sequelize');
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
    
    
    
exports.getProfile = async (userId) => await UserModel.findOne({ 
    where: {id:userId},
    attributes:["id","first_name","email","image_url"]
 })
.catch((error) => {
    console.log('error: ', error);
    throw new Error('User not found');
});


exports.retrieveAll = async (result) => {
    const queryResult = await UserModel.findAll({
        attributes: [
            'id',
            'first_name',
            'email'
        ],
        include: [
            {
                model: OtpModel,
                attributes: [],
                required: false,
            },
        ],
    }).catch((error) => {
        console.log(error);
        return result(responseHandler(false, 500, 'Something went wrong!', null), null);
    });
    if (utils.conditional.isArrayEmpty(queryResult)) {
        return result(responseHandler(false, 404, 'There are no users', null), null);
    }
    return result(null, responseHandler(true, 200, 'Success', usersMap));
}


exports.retrieveUserWithPlaylists = async (condition) => await UserModel.findOne({
    where: condition,
    attributes:['id'],
    include: [
        {
            model:PlaylistModel,
            attributes:['id','title','description','image_url','type','custom_playlist'],
             through: {
                attributes:[],
            },
            as:'playlists'
        }
    ]
}).then((data) => {
    if(!data){
        throw new Error("user not found")
    }
    return data;
})
    .catch((error) => {
        console.log('error: ', error);
        throw new Error('User not found');
    });
