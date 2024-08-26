const express = require("express")
const router = express.Router()
const userController = require("../controller/userController.js");
const admin = require("../middleware/admin.js")

router.route("/").get(admin,userController.retriveUsers)

module.exports = router