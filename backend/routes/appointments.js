// backend/routes/appointments.js
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
           status, notes
      FROM appointments
     WHERE business_id = ?
       AND DATE_FORMAT(appointment_datetime,'%Y-%m') = ?
  `;
  const params = [businessId, month];

  // תמיכה בסינון לפי status (למשל "pending" לבקשות חדשות)
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

  // כברירת מחדל – כל בקשה חדשה היא pending (בעל עסק יאשר/ידחה)
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

/* PUT /api/appointments/:id  (עדכון סטטוס – אישור/דחייה ע"י בעל העסק) */
router.put("/:id", async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: "Status required" });

  try {
    const db = await getDb();
    await db.query(
      "UPDATE appointments SET status = ? WHERE appointment_id = ?",
      [status, req.params.id]
    );
    res.json({ message: "Appointment updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
