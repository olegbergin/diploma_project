const db = require('../dbSingleton');

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

    // הכנת התאריך והשעה לפורמט MySQL datetime
    const appointmentDateTime = `${date} ${time}:00`;

    // קודם נבדוק או ניצור לקוח בטבלת users
    let customerId;

    // נחפש לקוח קיים לפי טלפון
    const findCustomerQuery = 'SELECT user_id FROM users WHERE phone = ?';
    const connection = db.getPromise();
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
        a.appointment_id,
        a.customer_id,
        a.business_id,
        a.service_id,
        a.appointment_datetime,
        a.status,
        a.notes,
        a.created_at,
        b.name AS business_name,
        b.location AS business_address,
        b.city AS business_city,
        b.category AS business_category,
        s.name AS service_name,
        s.price AS service_price,
        s.duration_minutes AS service_duration,
        s.description AS service_description
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
