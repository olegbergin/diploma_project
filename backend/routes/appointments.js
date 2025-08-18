// server/routes/appointments.js
const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise();

/** Helpers */
function currentMonthYYYYMM() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function isYYYYMM(s) {
  return typeof s === "string" && /^\d{4}-\d{2}$/.test(s);
}

function isYYYYMMDD(s) {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function isHHMM(s) {
  return typeof s === "string" && /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(s);
}

/* =========================================================
   GET /api/appointments?businessId=1[&month=YYYY-MM][&status=pending|approved|cancelled]
   הערה: month הפך ל-OPTIONAL. אם לא נשלח -> משתמשים בחודש הנוכחי.
   ========================================================= */
router.get("/", async (req, res) => {
  try {
    const { businessId, month, status } = req.query;

    const errors = {};
    const bid = parseInt(businessId);

    if (!bid || isNaN(bid)) {
      errors.businessId = "Valid business ID is required / נדרש מזהה עסק תקין";
    }

    const monthToUse = isYYYYMM(month) ? month : currentMonthYYYYMM();

    if (status && !["pending", "approved", "cancelled"].includes(status)) {
      errors.status =
        "Status must be pending, approved, or cancelled / סטטוס חייב להיות pending, approved או cancelled";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

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
    const params = [bid, monthToUse];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " ORDER BY appointment_datetime ASC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch appointments / שליפת תורים נכשלה" });
  }
});

/* =========================================================================
   POST /api/appointments
   יקבל אחד מהפורמטים:
   (א) date="YYYY-MM-DD", time="HH:MM"
   (ב) start="YYYY-MM-DDTHH:MM[:SS]" (ISO/ללא זונא)
   שדות חובה: businessId, serviceId, firstName, lastName, phone.
   ========================================================================= */
router.post("/", async (req, res) => {
  try {
    const {
      businessId,
      serviceId,
      date, // YYYY-MM-DD  (אופציונלי אם נשלח start)
      time, // HH:MM       (אופציונלי אם נשלח start)
      start, // ISO e.g. 2025-08-15T14:00  (אופציונלי אם נשלחו date+time)
      firstName,
      lastName,
      phone,
      email,
      notes = "",
    } = req.body;

    const errors = {};
    const bid = parseInt(businessId);
    const sid = parseInt(serviceId);

    if (!bid || isNaN(bid)) {
      errors.businessId = "Valid business ID is required / נדרש מזהה עסק תקין";
    }
    if (!sid || isNaN(sid)) {
      errors.serviceId = "Valid service ID is required / נדרש מזהה שירות תקין";
    }
    if (!firstName || !lastName || !phone) {
      errors.customer = "Customer information is required / פרטי לקוח נדרשים";
    }

    let appointmentDateTime = null;

    // תיעדוף: אם הגיע start – נשתמש בו, אחרת נשתמש ב-date+time
    if (start && !appointmentDateTime) {
      const parsed = new Date(start);
      if (isNaN(parsed.getTime())) {
        errors.start =
          "Invalid 'start' (ISO date-time expected) / ערך start לא תקין";
      } else {
        appointmentDateTime = parsed;
      }
    }

    if (!appointmentDateTime) {
      // נדרשים date + time
      if (!isYYYYMMDD(date)) {
        errors.date =
          "Date must be in YYYY-MM-DD format / תאריך חייב להיות בפורמט YYYY-MM-DD";
      }
      if (!isHHMM(time)) {
        errors.time =
          "Time must be in HH:MM format / שעה חייבת להיות בפורמט HH:MM";
      }
      if (!errors.date && !errors.time) {
        appointmentDateTime = new Date(`${date}T${time}:00`);
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // הגנה - לא ניתן לקבוע תור לעבר
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({
        errors: {
          date: "אי אפשר לקבוע תור לתאריך שכבר עבר / Cannot schedule appointment in the past",
        },
      });
    }

    // בדיקת קיום עסק
    const [businessCheck] = await db.query(
      "SELECT business_id FROM businesses WHERE business_id = ?",
      [bid]
    );
    if (businessCheck.length === 0) {
      return res
        .status(404)
        .json({ errors: { businessId: "Business not found / עסק לא נמצא" } });
    }

    // בדיקת התנגשות (לא כולל מבוטלים)
    const yyyy = appointmentDateTime.getFullYear();
    const mm = String(appointmentDateTime.getMonth() + 1).padStart(2, "0");
    const dd = String(appointmentDateTime.getDate()).padStart(2, "0");
    const hh = String(appointmentDateTime.getHours()).padStart(2, "0");
    const mi = String(appointmentDateTime.getMinutes()).padStart(2, "0");
    const datetime = `${yyyy}-${mm}-${dd} ${hh}:${mi}:00`;

    const [existingAppointment] = await db.query(
      `SELECT appointment_id FROM appointments 
       WHERE business_id = ? AND appointment_datetime = ? AND status != 'cancelled'`,
      [bid, datetime]
    );
    if (existingAppointment.length > 0) {
      return res.status(409).json({
        errors: { time: "זמן זה כבר תפוס / This time slot is already booked" },
      });
    }

    // Find or create customer (לפי phone)
    let customerId;
    const [existingCustomer] = await db.query(
      "SELECT user_id FROM users WHERE phone = ?",
      [phone]
    );
    if (existingCustomer.length > 0) {
      customerId = existingCustomer[0].user_id;
    } else {
      const [customerResult] = await db.query(
        `INSERT INTO users (first_name, last_name, phone, email, role, created_at)
         VALUES (?, ?, ?, ?, 'customer', NOW())`,
        [firstName, lastName, phone, email || null]
      );
      customerId = customerResult.insertId;
    }

    // יצירת תור (pending)
    const [result] = await db.query(
      `INSERT INTO appointments
         (customer_id, business_id, service_id, appointment_datetime, status, notes, created_at) 
       VALUES (?, ?, ?, ?, 'pending', ?, NOW())`,
      [customerId, bid, sid, datetime, notes || null]
    );

    res.status(201).json({
      message: "Appointment created successfully / תור נוצר בהצלחה",
      appointmentId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res
      .status(500)
      .json({ error: "Failed to create appointment / יצירת תור נכשלה" });
  }
});

/* =========================================================
   PUT /api/appointments/:id
   עדכון תאריך/שעה (בודק שלא מתנגש ושלא לעבר)
   ========================================================= */
router.put("/:id", async (req, res) => {
  const { appointment_datetime, business_id } = req.body;

  if (!appointment_datetime || !business_id) {
    return res
      .status(400)
      .json({ message: "appointment_datetime and business_id are required" });
  }

  if (new Date(appointment_datetime) < new Date()) {
    return res.status(400).json({ message: "אי אפשר לעדכן תור לעבר" });
  }

  try {
    const [existing] = await db.query(
      `SELECT appointment_id FROM appointments
        WHERE business_id = ?
          AND appointment_datetime = ?
          AND appointment_id != ?
          AND status != 'cancelled'`,
      [business_id, appointment_datetime, req.params.id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "כבר קיים תור בזמן הזה" });
    }

    const [result] = await db.query(
      `UPDATE appointments SET appointment_datetime = ? WHERE appointment_id = ?`,
      [appointment_datetime, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.json({ message: "Appointment updated successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

/* =========================================================
   POST /api/appointments/:id/cancel – ביטול תור
   ========================================================= */
router.post("/:id/cancel", async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE appointments SET status = 'cancelled' WHERE appointment_id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appointment cancelled successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

/* =========================================================
   GET /api/appointments/user/:userId?type=upcoming|past|canceled
   ========================================================= */
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { type } = req.query;

  let whereStatus = "";
  const params = [userId];

  if (type === "upcoming") {
    whereStatus =
      "AND a.status = 'approved' AND a.appointment_datetime >= NOW()";
  } else if (type === "past") {
    whereStatus =
      "AND a.status = 'approved' AND a.appointment_datetime < NOW()";
  } else if (type === "canceled") {
    whereStatus = "AND a.status = 'cancelled'";
  }

  try {
    const [rows] = await db.query(
      `
      SELECT a.*, b.name AS business_name, s.service_name
      FROM appointments a
      LEFT JOIN businesses b ON a.business_id = b.business_id
      LEFT JOIN services s    ON a.service_id    = s.service_id
      WHERE a.customer_id = ?
      ${whereStatus}
      ORDER BY a.appointment_datetime DESC
      `,
      params
    );
    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

/* =========================================================
   PUT /api/appointments/:id/status – עדכון סטטוס
   ========================================================= */
router.put("/:id/status", async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ message: "status is required" });
  }
  try {
    const [result] = await db.query(
      "UPDATE appointments SET status = ? WHERE appointment_id = ?",
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.json({ message: "Appointment status updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
