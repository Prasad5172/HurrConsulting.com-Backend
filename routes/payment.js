const express = require("express")
const router = express.Router()


const paymentController = require("../controller/paymentController.js")
const admin = require("../middleware/admin.js")


router.route("/").get(admin,paymentController.retrieveAll)
router.route("/refund").post(admin,paymentController.refund)


module.exports= router