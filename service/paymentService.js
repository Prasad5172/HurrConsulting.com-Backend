const bcrypt = require('bcryptjs')
const { responseHandler } = require('../helpers');
const { paymentRepository } = require("../repository")


exports.create = async (newPayment) => {
  const insertObj = await paymentRepository.create(newPayment);
  return insertObj;
};


exports.update = async (email, result) => {
  const response = await paymentRepository.retrieveOne({email:email});
  result(null, responseHandler(true, 200, 'Success', response));
};
exports.refund = async (email, result) => {
  const response = await paymentRepository.retrieveOne({email:email});
  result(null, responseHandler(true, 200, 'Success', response));
};
exports.retrieveAll = (result) => paymentRepository.retrieveAll(result);


exports.retriveOne = async (paymentId, result) => {
  const response = await paymentRepository.retrieveOne({payment_id:paymentId});
  // console.log(response)
  result(null, responseHandler(true, 200, 'Success', response));
};


exports.retrieveOneByEmail = async (email, result) => {
  const response = await paymentRepository.retrieveOne({email:email});
  result(null, responseHandler(true, 200, 'Success', response));
};

