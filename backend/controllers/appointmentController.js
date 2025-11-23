const db = require('../dbSingleton');
const scheduleUtils = require('../utils/scheduleUtils');

// יצירת תור חדש
const createAppointment = async (req, res) => {
  try {
    console.log('Creating appointment with data:', req.body);
    const {
      businessId,
      serviceId,
      date,
      time,
      customerInfo,
      serviceName,
      servicePrice,
      serviceDuration
    } = req.body;

    // בדיקת נתונים חובה
    if (!businessId || !serviceId || !date || !time || !customerInfo) {
      console.log('Missing required fields:', {
        businessId: !!businessId,
        serviceId: !!serviceId,
        date: !!date,
        time: !!time,
        customerInfo: !!customerInfo
      });
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['businessId', 'serviceId', 'date', 'time', 'customerInfo']
      });
    }

    const { firstName, lastName, phone, email, notes } = customerInfo;

    // בדיקת נתוני לקוח חובה
    if (!firstName || !lastName || !phone) {
      console.log('Missing required customer information:', {
        firstName: !!firstName,
        lastName: !!lastName,
        phone: !!phone,
        customerInfo
      });
      return res.status(400).json({
        error: 'Missing required customer information',
        required: ['firstName', 'lastName', 'phone']
      });
    }

    const connection = db.getPromise();

    // Fetch business to check working hours and exceptions
    const [businessRows] = await connection.query(
      'SELECT business_id, schedule, schedule_exceptions FROM businesses WHERE business_id = ? AND status = "approved"',
      [businessId]
    );

    if (businessRows.length === 0) {
      return res.status(404).json({
        error: 'Business not found or not approved'
      });
    }

    const business = businessRows[0];

    // Parse and validate against business hours and exceptions
    const schedule = scheduleUtils.parseSchedule(business.schedule);
    const exceptions = scheduleUtils.parseExceptions(business.schedule_exceptions);
    const appointmentDate = new Date(date);

    // Check for exception on this date
    const exception = scheduleUtils.getExceptionForDate(exceptions, appointmentDate);

    if (exception && exception.type === 'closure') {
      return res.status(400).json({
        error: 'Business is closed on the selected date',
        message: exception.title + (exception.description ? ' - ' + exception.description : ''),
        closureReason: 'exception'
      });
    }

    // Check if business is open on this day (considering exceptions)
    if (!scheduleUtils.isBusinessOpenWithExceptions(schedule, appointmentDate, exceptions)) {
      return res.status(400).json({
        error: 'Business is closed on the selected date',
        message: 'העסק סגור ביום זה'
      });
    }

    // Check if time is within business hours (considering exceptions)
    if (!scheduleUtils.isTimeWithinBusinessHoursWithExceptions(schedule, appointmentDate, time, exceptions)) {
      let hoursMessage;

      if (exception && exception.type === 'special_hours' && exception.customHours) {
        hoursMessage = `${exception.customHours.openTime}-${exception.customHours.closeTime}`;
      } else {
        const daySchedule = scheduleUtils.getScheduleForDate(schedule, appointmentDate);
        hoursMessage = daySchedule ? `${daySchedule.openTime}-${daySchedule.closeTime}` : '';
      }

      return res.status(400).json({
        error: 'Selected time is outside business hours',
        message: `השעה שנבחרה אינה בשעות הפעילות של העסק (${hoursMessage})`
      });
    }

    // הכנת התאריך והשעה לפורמט MySQL datetime
    const appointmentDateTime = `${date} ${time}:00`;

    // Check if time slot is already booked
    const [existingAppointment] = await connection.query(
      'SELECT appointment_id FROM appointments WHERE business_id = ? AND appointment_datetime = ? AND status != "cancelled"',
      [businessId, appointmentDateTime]
    );

    if (existingAppointment.length > 0) {
      return res.status(400).json({
        error: 'Time slot already booked',
        message: 'השעה שנבחרה כבר תפוסה'
      });
    }

    // קודם נבדוק או ניצור לקוח בטבלת users
    let customerId;

    // נחפש לקוח קיים לפי טלפון
    const findCustomerQuery = 'SELECT user_id FROM users WHERE phone = ?';
    const [existingCustomer] = await connection.query(findCustomerQuery, [phone]);

    if (existingCustomer.length > 0) {
      customerId = existingCustomer[0].user_id;
    } else {
      // ניצור לקוח חדש
      const createCustomerQuery = `
        INSERT INTO users (first_name, last_name, phone, email, role, created_at)
        VALUES (?, ?, ?, ?, 'customer', NOW())
      `;
      const [customerResult] = await connection.query(createCustomerQuery, [
        firstName,
        lastName,
        phone,
        email || null
      ]);
      customerId = customerResult.insertId;
    }

    // הכנסת התור לבסיס הנתונים
    const query = `
      INSERT INTO appointments (
        customer_id,
        business_id,
        service_id,
        appointment_datetime,
        status,
        notes,
        created_at
      ) VALUES (?, ?, ?, ?, 'scheduled', ?, NOW())
    `;

    const [result] = await connection.query(query, [
      customerId,
      businessId,
      serviceId,
      appointmentDateTime,
      notes || null
    ]);

    res.status(201).json({
      message: 'Appointment created successfully',
      appointmentId: result.insertId,
      appointment: {
        id: result.insertId,
        businessId,
        serviceId,
        date,
        time,
        customerInfo,
        serviceName,
        servicePrice,
        serviceDuration,
        status: 'scheduled'
      }
    });

  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      error: 'Failed to create appointment',
      details: error.message
    });
  }
};

// שליפת תורים לפי מזהה משתמש
const getAppointmentsForUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required'
      });
    }

    const query = `
      SELECT
        a.*,
        b.business_name,
        b.address as business_address,
        b.phone as business_phone,
        s.service_name,
        s.price as service_price,
        s.duration as service_duration
      FROM appointments a
      LEFT JOIN businesses b ON a.business_id = b.business_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.customer_id = ?
      ORDER BY a.appointment_datetime DESC
    `;

    const connection = db.getPromise();
    const [appointments] = await connection.query(query, [userId]);

    res.json({
      appointments: appointments || [],
      count: appointments ? appointments.length : 0
    });

  } catch (error) {
    console.error('Error fetching user appointments:', error);
    res.status(500).json({
      error: 'Failed to fetch appointments',
      details: error.message
    });
  }
};

module.exports = {
  createAppointment,
  getAppointmentsForUser,
};
