const express = require("express")
const router = express.Router()


const {emailController,otpController,userController} = require("../controller")
const {auth,oauth} = require("../middleware")

router.route("/sendOtp").post(emailController.sendOtp)
router.route("/verifyOtp").post(otpController.verifyOtp)
router.route("/signup").post(userController.register)
router.route("/signin").post(userController.login)
router.route("/checkEmail").get(userController.checkEmail)
router.route("/resetpassword").put(auth,userController.resetPassword)
router.route("/protected").get(oauth,userController.protected)
router.route("/verifyToken").get(userController.verifyToken)
router.route("/contactData").post(emailController.sendContactData)

module.exports= router