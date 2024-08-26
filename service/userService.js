const bcrypt = require('bcryptjs')
const { responseHandler } = require('../helpers/handler.js');
const  userRepository  = require("../repository/userRepository.js");
const { retriveOne } = require('./paymentService');


const register = async (newUser) => {
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(newUser.password, salt);
  const insertObj = await userRepository.create(newUser);
  return insertObj;
};


const retrieveAll = (result) => userRepository.retrieveAll(result);


const retriveOneById = async (userId, result) => {
  const response = await userRepository.retrieveOne({id:userId});
  // console.log(response)
  result(null, responseHandler(true, 200, 'Success', response));
};


const retrieveOneByEmail = async (email, result) => {
  const response = await userRepository.retrieveOne({email:email});
  result(null, responseHandler(true, 200, 'Success', response));
};

module.exports = {register,retriveOneById,retrieveAll,retrieveOneByEmail}