const express = require("express")
const router = express.Router()


const {paymentController} = require("../controller")
const {admin} = require("../middleware")

router.route("/payment/:id").put(paymentController.update)
router.route("/payment/:id").delete(paymentController.refund)
router.route("/payment/:id").get(paymentController.retrieveOne)
router.route("/payments").get(paymentController.retrieveAll)


module.exports= router