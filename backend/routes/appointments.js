const express = require("express");
const router = express.Router();
const getDb = require("../dbSingleton").getConnection;

/* GET /api/appointments?businessId=1&month=2025-05&status=pending */
router.get("/", async (req, res) => {
  const { businessId, month, status } = req.query; // month = 'YYYY-MM'
  if (!businessId || !month)
    return res.status(400).json({ message: "businessId & month are required" });

  let sql = `
    SELECT appointment_id, customer_id, service_id,
           DATE_FORMAT(appointment_datetime,'%Y-%m-%d') AS date,
           DATE_FORMAT(appointment_datetime,'%H:%i')     AS time,
           appointment_datetime,
           status, notes
      FROM appointments
     WHERE business_id = ?
       AND DATE_FORMAT(appointment_datetime,'%Y-%m') = ?
  `;
  const params = [businessId, month];

  if (status) {
    sql += " AND status = ?";
    params.push(status);
  }

  try {
    const db = await getDb();
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

/* POST /api/appointments  (לקוח מבצע בקשת תור – נכנס כ-pending) */
router.post("/", async (req, res) => {
  const {
    business_id,
    customer_id = 0,
    service_id = 0,
    date, // 'YYYY-MM-DD'
    time, // 'HH:MM'
    notes = "",
    status, // אפשרי: נשלח מהקליינט
  } = req.body;

  if (!business_id || !date || !time)
    return res
      .status(400)
      .json({ message: "business_id, date, time are required" });

  const statusToSet = status || "pending";
  const datetime = `${date} ${time}`;

  try {
    const db = await getDb();
    await db.query(
      `INSERT INTO appointments
         (customer_id, business_id, service_id,
          appointment_datetime, status, notes)
       VALUES (?,?,?,?,?,?)`,
      [customer_id, business_id, service_id, datetime, statusToSet, notes]
    );
    res.status(201).json({ message: "Appointment request sent" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

/* PUT /api/appointments/:id – עדכון תאריך ושעה עם בדיקה שאין תור אחר */
router.put("/:id", async (req, res) => {
  const { appointment_datetime, business_id } = req.body;

  if (!appointment_datetime || !business_id)
    return res
      .status(400)
      .json({ message: "appointment_datetime and business_id are required" });

  try {
    const db = await getDb();

    // בדיקה אם קיים תור באותו זמן לאותו עסק (למעט התור הנוכחי)
    const [existing] = await db.query(
      `SELECT * FROM appointments
        WHERE business_id = ?
          AND appointment_datetime = ?
          AND appointment_id != ?
          AND status != 'cancelled'`,
      [business_id, appointment_datetime, req.params.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "כבר קיים תור בזמן הזה" });
    }

    // עדכון התור
    await db.query(
      `UPDATE appointments SET appointment_datetime = ? WHERE appointment_id = ?`,
      [appointment_datetime, req.params.id]
    );

    res.json({ message: "Appointment updated successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

/* POST /api/appointments/:id/cancel – ביטול תור */
router.post("/:id/cancel", async (req, res) => {
  try {
    const db = await getDb();
    await db.query(
      `UPDATE appointments SET status = 'cancelled' WHERE appointment_id = ?`,
      [req.params.id]
    );
    res.json({ message: "Appointment cancelled successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
