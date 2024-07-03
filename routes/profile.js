const express = require("express")
const router = express.Router()
const {userController} = require("../controller")
const {auth } = require("../middleware")

router.route("/").get(auth,userController.retriveUser)


module.exports= router