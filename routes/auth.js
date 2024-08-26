const express = require("express")
const router = express.Router()


const emailController = require("../controller/emailController.js")
const otpController = require("../controller/otpController.js")
const userController = require("../controller/userController.js")
const auth = require("../middleware/auth.js")
const oauth = require("../middleware/oauth.js")

router.route("/sendOtp").post(emailController.sendOtp)
router.route("/verifyOtp").post(otpController.verifyOtp)
router.route("/signup").post(userController.register)
router.route("/signin").post(userController.login)
router.route("/checkEmail").get(userController.checkEmail)
router.route("/resetpassword").put(auth,userController.resetPassword)
router.route("/verifyToken").get(userController.verifyToken)
router.route("/contactData").post(emailController.sendContactData)

module.exports= router