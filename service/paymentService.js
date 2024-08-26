const bcrypt = require('bcryptjs')
const { responseHandler } = require('../helpers/handler.js');
const  paymentRepository  = require("../repository/paymentRepository.js")


const create = async (newPayment) => {
  const insertObj = await paymentRepository.create(newPayment);
  return insertObj;
};


const update = async (email, result) => {
  const response = await paymentRepository.retrieveOne({email:email});
  result(null, responseHandler(true, 200, 'Success', response));
};
const refund = async (email, result) => {
  const response = await paymentRepository.retrieveOne({email:email});
  result(null, responseHandler(true, 200, 'Success', response));
};
const retrieveAll = (result) => paymentRepository.retrieveAll(result);


const retriveOne = async (paymentId, result) => {
  const response = await paymentRepository.retrieveOne({payment_id:paymentId});
  // console.log(response)
  result(null, responseHandler(true, 200, 'Success', response));
};


const retrieveOneByEmail = async (email, result) => {
  const response = await paymentRepository.retrieveOne({email:email});
  result(null, responseHandler(true, 200, 'Success', response));
};

module.exports = {create,update,refund,retrieveAll,retriveOne,retrieveOneByEmail}
