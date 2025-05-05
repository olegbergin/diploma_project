const express = require("express");
const router = express.Router();
const {
  createAppointment,
  getAppointmentsForUser,
} = require("../controllers/appointmentController");

router.post("/", createAppointment);
router.get("/user/:userId", getAppointmentsForUser);

module.exports = router;
