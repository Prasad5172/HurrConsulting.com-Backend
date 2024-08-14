const bcryptjs = require("bcryptjs");
const { paymentService } = require("../service");
const { responseHandler, asyncHandler, getJwtToken } = require("../helpers");
const { PaymentModel } = require("../model");
const stripe = require("stripe")(`${process.env.STRIPE_SECRET_KEY}`);

exports.retrieveAll = asyncHandler(async (req, res) => {
  try {
    // Optionally, retrieve query parameters from the request
    const { email } = req.query; // Example: ?email=user@example.com

    // Find all payments, optionally filtering by email if provided
    const queryOptions = {};
    if (email) {
      queryOptions.where = { email }; // Filter by email if provided
    }

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

exports.refund = asyncHandler(async (req, res) => {
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


