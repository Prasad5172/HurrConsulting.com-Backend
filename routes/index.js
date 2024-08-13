const express = require("express")
const router = express.Router()


router.use("/auth",require("./auth"))
router.use("/user",require("./user"))
router.use("/users",require("./users"))
router.use("/payment",require("./payment"))
router.use("/event",require("./calender"))



module.exports= router