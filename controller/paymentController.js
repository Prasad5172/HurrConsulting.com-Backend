const bcryptjs = require("bcryptjs");
const { paymentService } = require("../service");
const { responseHandler, asyncHandler, getJwtToken } = require("../helpers");
const {PaymentModel} = require("../model");



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
  const { email } = req.body;
  let user = null;
  await paymentService.retrieveOneByEmail(email, (err, data) => {
    if (err) {
      return res.status(err.code).json(err);
    }
    user = data;
  });
  if (user) {
    res.status(200).json("successful");
  } else {
    res.status(400).json("notsuccessful");
  }
});
