const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise();

/* GET /api/appointments?businessId=1&month=2025-05&status=pending */
router.get("/", async (req, res) => {
  try {
    const { businessId, month, status } = req.query; // month = 'YYYY-MM'
    
    // Validation
    const errors = {};
    
    if (!businessId || isNaN(parseInt(businessId))) {
      errors.businessId = "Valid business ID is required / נדרש מזהה עסק תקין";
    }
    
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      errors.month = "Month must be in YYYY-MM format / חודש חייב להיות בפורמט YYYY-MM";
    }
    
    if (status && !['pending', 'approved', 'cancelled'].includes(status)) {
      errors.status = "Status must be pending, approved, or cancelled / סטטוס חייב להיות pending, approved או cancelled";
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
    const params = [parseInt(businessId), month];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments / שליפת תורים נכשלה" });
  }
});

/* POST /api/appointments  (לקוח מבצע בקשת תור – נכנס כ-pending) */
router.post("/", async (req, res) => {
  try {
    const {
      businessId,
      serviceId,
      date, // 'YYYY-MM-DD'
      time, // 'HH:MM'
      firstName,
      lastName,
      phone,
      email,
      notes = "",
    } = req.body;

    // Validation
    const errors = {};
    
    if (!businessId || isNaN(parseInt(businessId))) {
      errors.businessId = "Valid business ID is required / נדרש מזהה עסק תקין";
    }
    
    if (!serviceId || isNaN(parseInt(serviceId))) {
      errors.serviceId = "Valid service ID is required / נדרש מזהה שירות תקין";
    }
    
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.date = "Date must be in YYYY-MM-DD format / תאריך חייב להיות בפורמט YYYY-MM-DD";
    }
    
    if (!time || !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      errors.time = "Time must be in HH:MM format / שעה חייבת להיות בפורמט HH:MM";
    }

    if (!firstName || !lastName || !phone) {
      errors.customer = "Customer information is required / פרטי לקוח נדרשים";
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // *** הגנה - לא ניתן לקבוע תור לעבר ***
    const appointmentDateTime = new Date(`${date}T${time}:00`);
    if (appointmentDateTime < new Date()) {
      return res.status(400).json({ 
        errors: { date: "אי אפשר לקבוע תור לתאריך שכבר עבר / Cannot schedule appointment in the past" }
      });
    }

    // Check if business exists
    const [businessCheck] = await db.query(
      "SELECT business_id FROM businesses WHERE business_id = ?",
      [parseInt(businessId)]
    );
    
    if (businessCheck.length === 0) {
      return res.status(404).json({ 
        errors: { businessId: "Business not found / עסק לא נמצא" }
      });
    }

    // Check for conflicting appointments
    const datetime = `${date} ${time}:00`;
    const [existingAppointment] = await db.query(
      `SELECT appointment_id FROM appointments 
       WHERE business_id = ? AND appointment_datetime = ? AND status != 'cancelled'`,
      [parseInt(businessId), datetime]
    );
    
    if (existingAppointment.length > 0) {
      return res.status(409).json({ 
        errors: { time: "זמן זה כבר תפוס / This time slot is already booked" }
      });
    }

    // Find or create customer
    let customerId;
    const findCustomerQuery = 'SELECT user_id FROM users WHERE phone = ?';
    const [existingCustomer] = await db.query(findCustomerQuery, [phone]);
    
    if (existingCustomer.length > 0) {
      customerId = existingCustomer[0].user_id;
    } else {
      // Create new customer
      const createCustomerQuery = `INSERT INTO users (first_name, last_name, phone, email, role, created_at) VALUES (?, ?, ?, ?, 'customer', NOW())`;
      const [customerResult] = await db.query(createCustomerQuery, [firstName, lastName, phone, email || null]);
      customerId = customerResult.insertId;
    }

    // Create appointment
    const [result] = await db.query(
      `INSERT INTO appointments (customer_id, business_id, service_id, appointment_datetime, status, notes, created_at) 
       VALUES (?, ?, ?, ?, 'scheduled', ?, NOW())`,
      [customerId, parseInt(businessId), parseInt(serviceId), datetime, notes || null]
    );
    
    res.status(201).json({
      message: "Appointment created successfully / תור נוצר בהצלחה",
      appointmentId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Failed to create appointment / יצירת תור נכשלה" });
  }
});

/* PUT /api/appointments/:id – עדכון תאריך ושעה עם בדיקה שאין תור אחר */
router.put("/:id", async (req, res) => {
  const { appointment_datetime, business_id } = req.body;

  if (!appointment_datetime || !business_id)
    return res
      .status(400)
      .json({ message: "appointment_datetime and business_id are required" });

  // הגנה: לא לעדכן תור לעבר
  if (new Date(appointment_datetime) < new Date()) {
    return res.status(400).json({ message: "אי אפשר לעדכן תור לעבר" });
  }

  try {
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

/* POST /api/appointments/:id/cancel – ביטול תור */
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

/**
 * מחזיר את כל התורים של משתמש מסוים (עבור לוח הפרופיל האישי)
 */
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { type } = req.query; // type יכול להיות: upcoming, past, canceled

  let whereStatus = "";
  let params = [userId];

  if (type === "upcoming") {
    whereStatus = "AND status = 'approved' AND appointment_datetime >= NOW()";
  } else if (type === "past") {
    whereStatus = "AND status = 'approved' AND appointment_datetime < NOW()";
  } else if (type === "canceled") {
    whereStatus = "AND status = 'cancelled'";
  }

  try {
    const [rows] = await db.query(
      `
      SELECT a.*, b.name AS business_name, s.service_name
      FROM appointments a
      LEFT JOIN businesses b ON a.business_id = b.business_id
      LEFT JOIN services s ON a.service_id = s.service_id
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

// עדכון סטטוס (approve/cancel וכו')
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
