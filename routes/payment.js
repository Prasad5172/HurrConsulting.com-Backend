const express = require("express")
const router = express.Router()


const {paymentController} = require("../controller")
const {admin} = require("../middleware")

router.route("/:id").delete(paymentController.refund)
router.route("/").get(paymentController.retrieveAll)


module.exports= router