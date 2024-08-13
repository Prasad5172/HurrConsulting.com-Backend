const express = require("express")
const router = express.Router()


const {calenderController} = require("../controller")
const {admin} = require("../middleware")

router.route("/:eventId").get(admin,calenderController.getEvent)
router.route("/").post(admin,calenderController.createEvent)
router.route("/:eventId").put(admin,calenderController.updateEvent)
router.route("/:eventId").delete(admin,calenderController.deleteEvent)
router.route("/").get(admin,calenderController.getEvents)


module.exports= router