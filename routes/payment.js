const express = require("express")
const router = express.Router()


const {paymentController} = require("../controller")
const {admin} = require("../middleware")

// router.route("/:id").delete(paymentController.refund)
router.route("/").get(admin,paymentController.retrieveAll)
router.route("/refund").post(admin,paymentController.refund)


module.exports= router