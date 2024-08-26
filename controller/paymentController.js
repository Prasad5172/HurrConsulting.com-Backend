const bcryptjs = require("bcryptjs");
const paymentService = require("../service/paymentService.js");
const { responseHandler, asyncHandler,  } = require("../helpers/handler.js");
const { PaymentModel } = require("../model/Payment.js");
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);

const retrieveAll = asyncHandler(async (req, res) => {
  try {
    // Retrieve query parameters from the request
    const { email, sortBy, sortOrder } = req.query; // Example: ?email=user@example.com&sortBy=request_date&sortOrder=desc
    // Initialize query options
    const queryOptions = {};
    // Filter by email if provided
    if (email) {
      queryOptions.where = { email };
    }
    // Set default sortBy and sortOrder
    const sortField = sortBy || 'request_date'; // Default to 'request_date'
    const sortDirection = sortOrder === 'desc' ? 'DESC' : 'ASC'; // Default to 'ASC'

    // Add order option to query options
    queryOptions.order = [[sortField, sortDirection]];

    // Fetch payments with sorting
    const payments = await PaymentModel.findAll(queryOptions);

    return res.status(200).json(payments);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

const refund = asyncHandler(async (req, res) => {
  const { payment_intent } = req.body;
  console.log(payment_intent);
  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment_intent,
    });
    res.status(200).json(refund);
  } catch (error) {
    console.log(error);
    res.status(400).json(responseHandler(false, 400, error.message, null));
  }
});


module.exports = {refund,retrieveAll}