const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise();
const emailService = require("../services/emailService");

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
      SELECT a.appointment_id, a.customer_id, a.service_id, a.business_id,
             DATE(a.appointment_datetime) AS date,
             TIME_FORMAT(a.appointment_datetime,'%H:%i') AS time,
             a.appointment_datetime,
             a.status, a.notes,
             COALESCE(u.first_name, 'לקוח') AS first_name, 
             COALESCE(u.last_name, 'לא ידוע') AS last_name,
             COALESCE(u.phone, '') AS customer_phone,
             COALESCE(s.name, 'שירות לא ידוע') AS service_name, 
             COALESCE(s.price, 0) AS price, 
             COALESCE(s.duration_minutes, 0) AS duration_minutes,
             s.service_id as joined_service_id,
             s.business_id as service_business_id
        FROM appointments a
        LEFT JOIN users u ON a.customer_id = u.user_id
        LEFT JOIN services s ON a.service_id = s.service_id AND s.business_id = a.business_id
       WHERE a.business_id = ?
         AND DATE_FORMAT(a.appointment_datetime,'%Y-%m') = ?
    `;
    const params = [parseInt(businessId), month];

    if (status) {
      sql += " AND status = ?";
      params.push(status);
    }

    // Debug: Check database timezone
    const [timezoneCheck] = await db.query('SELECT NOW() as server_time, @@session.time_zone as session_tz, @@global.time_zone as global_tz');
    console.log('Database timezone info:', timezoneCheck[0]);

    const [rows] = await db.query(sql, params);
    
    // Debug: Check what services exist for this business
    const [servicesCheck] = await db.query(
      'SELECT service_id, business_id, name FROM services WHERE business_id = ? LIMIT 5',
      [parseInt(businessId)]
    );
    console.log(`Services available for business ${businessId}:`, servicesCheck);
    
    // Debug logging to see what's happening with the JOIN and dates
    console.log(`Appointments query for business ${businessId}, month ${month}:`);
    console.log('Sample appointments with dates:', rows.slice(0, 3).map(row => ({
      appointment_id: row.appointment_id,
      date: row.date,
      time: row.time,
      appointment_datetime: row.appointment_datetime,
      service_name: row.service_name,
      customer_name: `${row.first_name} ${row.last_name}`
    })));
    
    const transformedAppointments = rows.map(row => ({
      appointmentId: row.appointment_id,
      appointment_id: row.appointment_id,
      customerId: row.customer_id,
      serviceId: row.service_id,
      date: row.date,
      time: row.time,
      appointmentDatetime: row.appointment_datetime,
      appointment_datetime: row.appointment_datetime,
      status: row.status,
      notes: row.notes,
      first_name: row.first_name,
      last_name: row.last_name,
      customer_name: `${row.first_name} ${row.last_name}`,
      service_name: row.service_name,
      name: row.service_name,
      price: row.price,
      duration_minutes: row.duration_minutes,
      // Debug fields
      debug_joined_service_id: row.joined_service_id,
      debug_service_business_id: row.service_business_id
    }));
    
    res.json(transformedAppointments);
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
       VALUES (?, ?, ?, ?, 'pending', ?, NOW())`,
      [customerId, parseInt(businessId), parseInt(serviceId), datetime, notes || null]
    );

    // Send email notifications
    try {
      // Fetch business and service details for email
      const [businessDetails] = await db.query(
        `SELECT b.name, b.location, u.email as owner_email, u.phone as owner_phone, u.first_name, u.last_name
         FROM businesses b
         LEFT JOIN users u ON b.owner_id = u.user_id
         WHERE b.business_id = ?`,
        [parseInt(businessId)]
      );

      const [serviceDetails] = await db.query(
        `SELECT name, price FROM services WHERE service_id = ?`,
        [parseInt(serviceId)]
      );

      if (businessDetails.length > 0 && serviceDetails.length > 0) {
        const business = businessDetails[0];
        const service = serviceDetails[0];

        // Send confirmation email to customer
        if (email) {
          await emailService.sendBookingConfirmation({
            customerEmail: email,
            customerName: `${firstName} ${lastName}`,
            businessName: business.name,
            serviceName: service.name,
            appointmentDate: date,
            appointmentTime: time,
            price: service.price,
            businessPhone: business.owner_phone || '',
            businessAddress: business.location || '',
            notes: notes || ''
          });
        }

        // Send notification to business owner
        if (business.owner_email) {
          await emailService.sendBusinessNotification({
            businessEmail: business.owner_email,
            businessName: business.name,
            customerName: `${firstName} ${lastName}`,
            customerPhone: phone,
            customerEmail: email || '',
            serviceName: service.name,
            appointmentDate: date,
            appointmentTime: time,
            price: service.price,
            notes: notes || ''
          });
        }
      }
    } catch (emailError) {
      // Log email errors but don't fail the appointment creation
      console.error('Error sending booking emails:', emailError);
    }

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
    // Fetch old appointment details before update
    const [oldAppointment] = await db.query(
      `SELECT a.appointment_datetime, u.email, u.first_name, u.last_name, b.name as business_name, s.name as service_name
       FROM appointments a
       LEFT JOIN users u ON a.customer_id = u.user_id
       LEFT JOIN businesses b ON a.business_id = b.business_id
       LEFT JOIN services s ON a.service_id = s.service_id
       WHERE a.appointment_id = ?`,
      [req.params.id]
    );

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

    // Send reschedule email
    if (oldAppointment.length > 0 && oldAppointment[0].email) {
      try {
        const old = oldAppointment[0];
        const oldDate = new Date(old.appointment_datetime);
        const newDate = new Date(appointment_datetime);

        await emailService.sendRescheduleEmail({
          customerEmail: old.email,
          customerName: `${old.first_name} ${old.last_name}`,
          businessName: old.business_name,
          serviceName: old.service_name,
          oldDate: oldDate.toISOString().split('T')[0],
          oldTime: oldDate.toTimeString().split(' ')[0].substring(0, 5),
          newDate: newDate.toISOString().split('T')[0],
          newTime: newDate.toTimeString().split(' ')[0].substring(0, 5)
        });
      } catch (emailError) {
        console.error('Error sending reschedule email:', emailError);
      }
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
    // Fetch appointment details before cancellation
    const [appointmentDetails] = await db.query(
      `SELECT a.appointment_datetime, a.status, u.email, u.first_name, u.last_name,
              b.name as business_name, s.name as service_name
       FROM appointments a
       LEFT JOIN users u ON a.customer_id = u.user_id
       LEFT JOIN businesses b ON a.business_id = b.business_id
       LEFT JOIN services s ON a.service_id = s.service_id
       WHERE a.appointment_id = ?`,
      [req.params.id]
    );

    const [result] = await db.query(
      `UPDATE appointments SET status = 'cancelled' WHERE appointment_id = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Send cancellation email
    if (appointmentDetails.length > 0 && appointmentDetails[0].email) {
      try {
        const appointment = appointmentDetails[0];
        const appointmentDate = new Date(appointment.appointment_datetime);

        await emailService.sendCancellationEmail({
          customerEmail: appointment.email,
          customerName: `${appointment.first_name} ${appointment.last_name}`,
          businessName: appointment.business_name,
          serviceName: appointment.service_name,
          appointmentDate: appointmentDate.toISOString().split('T')[0],
          appointmentTime: appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
          cancelledBy: 'הלקוח' // This is customer-initiated cancellation
        });
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
      }
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
      SELECT a.appointment_id, a.customer_id, a.business_id, a.service_id,
             a.appointment_datetime, a.status, a.notes, a.created_at,
             b.name AS business_name, s.name AS service_name, s.price, s.duration_minutes
      FROM appointments a
      LEFT JOIN businesses b ON a.business_id = b.business_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.customer_id = ?
      ${whereStatus}
      ORDER BY a.appointment_datetime DESC
      `,
      params
    );
    
    const transformedAppointments = rows.map(row => ({
      appointmentId: row.appointment_id,
      customerId: row.customer_id,
      businessId: row.business_id,
      serviceId: row.service_id,
      appointmentDatetime: row.appointment_datetime,
      status: row.status,
      notes: row.notes,
      createdAt: row.created_at,
      businessName: row.business_name,
      serviceName: row.service_name,
      price: row.price,
      durationMinutes: row.duration_minutes
    }));
    
    res.json(transformedAppointments);
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
    // Fetch appointment details before status update
    const [appointmentDetails] = await db.query(
      `SELECT a.appointment_datetime, a.status as old_status, u.email, u.first_name, u.last_name,
              b.name as business_name, s.name as service_name
       FROM appointments a
       LEFT JOIN users u ON a.customer_id = u.user_id
       LEFT JOIN businesses b ON a.business_id = b.business_id
       LEFT JOIN services s ON a.service_id = s.service_id
       WHERE a.appointment_id = ?`,
      [req.params.id]
    );

    const [result] = await db.query(
      "UPDATE appointments SET status = ? WHERE appointment_id = ?",
      [status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Send status change email
    if (appointmentDetails.length > 0 && appointmentDetails[0].email) {
      try {
        const appointment = appointmentDetails[0];
        const appointmentDate = new Date(appointment.appointment_datetime);
        const oldStatus = appointment.old_status;

        // Send appropriate email based on status change
        if (status === 'cancelled' || status === 'cancelled_by_business' || status === 'cancelled_by_user') {
          await emailService.sendCancellationEmail({
            customerEmail: appointment.email,
            customerName: `${appointment.first_name} ${appointment.last_name}`,
            businessName: appointment.business_name,
            serviceName: appointment.service_name,
            appointmentDate: appointmentDate.toISOString().split('T')[0],
            appointmentTime: appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
            cancelledBy: status === 'cancelled_by_business' ? 'העסק' : 'הלקוח'
          });
        } else {
          await emailService.sendStatusChangeEmail({
            customerEmail: appointment.email,
            customerName: `${appointment.first_name} ${appointment.last_name}`,
            businessName: appointment.business_name,
            serviceName: appointment.service_name,
            appointmentDate: appointmentDate.toISOString().split('T')[0],
            appointmentTime: appointmentDate.toTimeString().split(' ')[0].substring(0, 5),
            oldStatus: oldStatus,
            newStatus: status
          });
        }
      } catch (emailError) {
        console.error('Error sending status change email:', emailError);
      }
    }

    res.json({ message: "Appointment status updated" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "DB error" });
  }
});

module.exports = router;
