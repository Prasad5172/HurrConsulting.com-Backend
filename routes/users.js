const express = require("express")
const router = express.Router()
const {userController} = require("../controller")
const {admin } = require("../middleware")

router.route("/").get(admin,userController.retriveUsers)



module.exports= router