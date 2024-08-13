const bcryptjs = require("bcryptjs");
const { paymentService } = require("../service");
const { responseHandler, asyncHandler, getJwtToken } = require("../helpers");
const { paymentRepository,userRepository } = require("../repository");


exports.update = asyncHandler(async (req, res) => {
  console.log("update payment");

  const { payment_id } = req.params; // Assuming payment_id is sent as a URL parameter
  const { status } = req.body; // Assuming status is sent in the request body

  try {
    // Find the payment by payment_id
    const payment = await PaymentModel.findOne({ where: { payment_id } });

    if (!payment) {
      return res
        .status(404)
        .json(responseHandler(false, 404, "Payment Not Found", null));
    }

    // Update the payment status or any other fields
    payment.status = status || payment.status; // Update status if provided, else keep existing
    // Add any other field updates here if needed

    // Save the updated payment
    await payment.save();

    // Respond with the updated payment
    return res
      .status(200)
      .json(
        responseHandler(true, 200, "Payment Updated Successfully", payment)
      );
  } catch (error) {
    console.log(error + " - update payment");
    return res
      .status(500)
      .json(responseHandler(false, 500, error.message, null));
  }
});

exports.retrieveOne = asyncHandler(async (req, res) => {
  const { payment_id } = req.params; // Assuming payment_id is sent as a URL parameter
  try {
    // Find the payment by payment_id
    const payment = await PaymentModel.findOne({ where: { payment_id } });

    if (payment) {
      return res.status(200).json({
        success: true,
        message: "Payment retrieved successfully",
        data: payment,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

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

    return res.status(200).json({
      success: true,
      message: "Payments retrieved successfully",
      data: payments,
    });
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
