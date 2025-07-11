const express = require("express")
const router = express.Router()


const calenderController = require("../controller/calenderController.js")
const admin = require("../middleware/admin.js")

router.route("/:eventId").get(admin,calenderController.getEvent)
router.route("/").post(calenderController.createEvent)
router.route("/:eventId").put(admin,calenderController.updateEvent)
router.route("/:eventId").delete(admin,calenderController.deleteEvent)
router.route("/").get(admin,calenderController.getEvents)


module.exports= router