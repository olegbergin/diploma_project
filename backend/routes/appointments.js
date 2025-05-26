// backend/routes/appointments.js
const express = require("express");
const router = express.Router();
const getDb = require("../dbSingleton").getConnection;

/* GET /api/appointments?businessId=1&month=2025-05 */
router.get("/", async (req, res) => {
  const { businessId, month } = req.query; // month = 'YYYY-MM'
  if (!businessId || !month)
    return res.status(400).json({ message: "businessId & month are required" });

  try {
    const db = await getDb();
    const [rows] = await db.query(
      `SELECT appointment_id, customer_id, service_id,
              DATE_FORMAT(appointment_datetime,'%Y-%m-%d') AS date,
              DATE_FORMAT(appointment_datetime,'%H:%i')     AS time,
              status, notes
         FROM appointments
        WHERE business_id = ?
          AND DATE_FORMAT(appointment_datetime,'%Y-%m') = ?`,
      [businessId, month]
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

/* POST /api/appointments  (כאשר בעל-עסק מאשר בקשה) */
router.post("/", async (req, res) => {
  const {
    business_id,
    customer_id = 0, // בחרי איך לנהל אם אין טבלת customers עדיין
    service_id = 0,
    date, // 'YYYY-MM-DD'
    time, // 'HH:MM'
    notes = "",
  } = req.body;

  if (!business_id || !date || !time)
    return res
      .status(400)
      .json({ message: "business_id, date, time are required" });

  const status = "scheduled";
  const datetime = `${date} ${time}`; // הופך ל-DATETIME

  try {
    const db = await getDb();
    await db.query(
      `INSERT INTO appointments
         (customer_id, business_id, service_id,
          appointment_datetime, status, notes)
       VALUES (?,?,?,?,?,?)`,
      [customer_id, business_id, service_id, datetime, status, notes]
    );
    res.status(201).json({ message: "Appointment created" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
