const express = require("express")
const router = express.Router()
const userController = require("../controller/userController.js")
const auth  = require("../middleware/auth.js")

router.route("/").get(auth,userController.retriveUser)



module.exports= router