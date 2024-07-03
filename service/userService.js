const bcrypt = require('bcryptjs')
const { responseHandler } = require('../helpers');
const { userRepository } = require("../repository")


exports.register = async (newUser) => {
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(newUser.password, salt);
  const insertObj = await userRepository.create(newUser);
  return insertObj;
};


exports.retrieveAll = (result) => userRepository.retrieveAll(result);


exports.retriveOneById = async (userId, result) => {
  const response = await userRepository.retrieveOne({id:userId});
  // console.log(response)
  result(null, responseHandler(true, 200, 'Success', response));
};


exports.retrieveOneByEmail = async (email, result) => {
  const response = await userRepository.retrieveOne({email:email});
  result(null, responseHandler(true, 200, 'Success', response));
};
