const db = require("../dbSingleton");

exports.getAllBusinesses = async (req, res) => {
  try {
    const connection = db.getPromise();
    // מציגים ללקוחות רק עסקים מאושרים
    const [rows] = await connection.query(
      "SELECT * FROM businesses WHERE status = 'approved'"
    );
    res.json(rows);
  } catch (error) {
    console.error("DB error fetching all businesses:", error);
    res.status(500).json({ error: "Failed to fetch businesses." });
  }
};

exports.createBusiness = async (req, res) => {
  const {
    name,
    category,
    description,
    address = "",
    opening_hours = "",
  } = req.body;

  // העסק ייווצר כ-pending כדי שהאדמין יאשר
  const sql = `
    INSERT INTO businesses (name, category, description, location, photos, schedule, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    name,
    category,
    description,
    address, // address maps to location
    "[]", // empty photos array
    opening_hours ? JSON.stringify({ opening_hours: opening_hours }) : "{}", // schedule as JSON
    "pending", // סטטוס התחלתי – ממתין לאישור אדמין
  ];

  try {
    const connection = db.getPromise();
    const [result] = await connection.query(sql, params);
    res
      .status(201)
      .json({
        id: result.insertId,
        message: "Business created, pending admin approval",
      });
  } catch (error) {
    console.error("DB error creating business:", error);
    res.status(500).json({ error: "Failed to create business." });
  }
};

exports.updateBusiness = async (req, res) => {
  const {
    name,
    category,
    description,
    phone,
    email,
    address,
    working_hours = "",
    schedule_exceptions = "",
    gallery = [],
  } = req.body;

  try {
    const connection = db.getPromise();
    const businessId = req.params.id;

    // Convert gallery array to photos JSON format
    let photosJson = "[]";
    if (gallery && Array.isArray(gallery) && gallery.length > 0) {
      // Handle both object format {url: "..."} and direct URL strings
      const photoUrls = gallery
        .map((item) => (typeof item === "string" ? item : item.url || item))
        .filter((url) => url && typeof url === "string");
      photosJson = JSON.stringify(photoUrls);
    }

    const businessSql = `
      UPDATE businesses SET
        name = ?,
        category = ?,
        description = ?,
        location = ?,
        photos = ?,
        schedule = ?,
        schedule_exceptions = ?
      WHERE business_id = ?
    `;
    const businessParams = [
      name,
      category,
      description,
      address,
      photosJson,
      working_hours || "{}",
      schedule_exceptions || "[]",
      businessId,
    ];

    const [result] = await connection.query(businessSql, businessParams);

    // Handle owner contact info update
    if (phone || email) {
      try {
        const [ownerRows] = await connection.query(
          "SELECT owner_id FROM businesses WHERE business_id = ?",
          [businessId]
        );
        if (ownerRows.length > 0 && ownerRows[0].owner_id) {
          const ownerId = ownerRows[0].owner_id;

          const userUpdates = [];
          const userParams = [];

          if (phone) {
            userUpdates.push("phone = ?");
            userParams.push(phone);
          }
          if (email) {
            userUpdates.push("email = ?");
            userParams.push(email);
          }

          if (userUpdates.length > 0) {
            const userSql = `UPDATE users SET ${userUpdates.join(
              ", "
            )} WHERE user_id = ?`;
            userParams.push(ownerId);
            await connection.query(userSql, userParams);
          }
        }
      } catch (userError) {
        // Don't fail the whole request if user update fails
        console.error("Error updating user contact info:", userError);
      }
    }

    res.json({ message: "Business updated successfully" });
  } catch (error) {
    console.error(
      `DB error updating business with id ${req.params.id}:`,
      error
    );
    res.status(500).json({
      error: "Failed to update business.",
      details: error.message,
    });
  }
};

exports.deleteBusiness = async (req, res) => {
  try {
    const connection = db.getPromise();
    const [result] = await connection.query(
      "DELETE FROM businesses WHERE business_id = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Business not found" });
    }

    res.json({ message: "Business deleted successfully" });
  } catch (error) {
    console.error(
      `DB error deleting business with id ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to delete business." });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const connection = db.getPromise();
    // קטגוריות רק מעסקים מאושרים
    const [rows] = await connection.query(
      "SELECT DISTINCT category FROM businesses WHERE category IS NOT NULL AND category != '' AND status = 'approved' ORDER BY category"
    );
    const categories = rows.map((row) => row.category);
    res.json(categories);
  } catch (error) {
    console.error("DB error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
};

// שימי לב: יש כאן הגדרה שנייה ל-getBusinessById – זו זו שבפועל בשימוש
exports.getBusinessById = async (req, res) => {
  try {
    const connection = db.getPromise();
    const businessId = req.params.id;

    const businessSql = `
      SELECT 
        b.*,
        u.phone as owner_phone,
        u.email as owner_email,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name
      FROM businesses b
      LEFT JOIN users u ON b.owner_id = u.user_id
      WHERE b.business_id = ?
        AND b.status = 'approved'
    `;

    const [businessRows] = await connection.query(businessSql, [businessId]);

    if (businessRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Business not found or not approved" });
    }

    const servicesSql =
      "SELECT * FROM services WHERE business_id = ? ORDER BY name ASC";
    const [servicesRows] = await connection.query(servicesSql, [businessId]);

    const ratingSql = `
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_reviews
      FROM reviews 
      WHERE business_id = ?
    `;
    const [ratingRows] = await connection.query(ratingSql, [businessId]);

    const business = businessRows[0];
    const ratingData = ratingRows[0] || {};

    const transformedBusiness = {
      businessId: business.business_id,
      id: business.business_id,
      ownerId: business.owner_id,
      business_name: business.name,
      name: business.name,
      category: business.category,
      description: business.description,
      address: business.location, // address comes from location field
      location: business.location,
      photos: business.photos,
      schedule: business.schedule,
      schedule_exceptions: business.schedule_exceptions,
      createdAt: business.created_at,
      phone: business.owner_phone, // phone from business owner
      email: business.owner_email, // email from business owner
      owner_name:
        business.owner_first_name && business.owner_last_name
          ? `${business.owner_first_name} ${business.owner_last_name}`
          : null,
      average_rating: ratingData.average_rating
        ? parseFloat(ratingData.average_rating).toFixed(1)
        : null,
      rating: ratingData.average_rating
        ? parseFloat(ratingData.average_rating).toFixed(1)
        : null,
      total_reviews: ratingData.total_reviews || 0,
      services: servicesRows.map((service) => ({
        serviceId: service.service_id,
        businessId: service.business_id,
        name: service.name,
        price: service.price,
        duration: service.duration_minutes,
        durationMinutes: service.duration_minutes,
        description: service.description,
        createdAt: service.created_at,
        category: service.category,
        isActive: service.is_active,
      })),
    };

    res.json(transformedBusiness);
  } catch (error) {
    console.error(
      `DB error fetching business with id ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch business details." });
  }
};

exports.getBusinessServices = async (req, res) => {
  try {
    const connection = db.getPromise();

    const [businessRows] = await connection.query(
      'SELECT business_id FROM businesses WHERE business_id = ? AND status = "approved"',
      [req.params.id]
    );

    if (businessRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Business not found or not approved" });
    }

    const [services] = await connection.query(
      "SELECT service_id, business_id, name, description, price, duration_minutes, category, is_active, created_at FROM services WHERE business_id = ? ORDER BY name ASC",
      [req.params.id]
    );

    const transformedServices = services.map((service) => ({
      serviceId: service.service_id,
      businessId: service.business_id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration_minutes,
      durationMinutes: service.duration_minutes,
      category: service.category,
      isActive: service.is_active,
      createdAt: service.created_at,
    }));

    res.json(transformedServices);
  } catch (error) {
    console.error(
      `DB error fetching services for business ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch services." });
  }
};

exports.getBusinessReviews = async (req, res) => {
  try {
    const connection = db.getPromise();

    const [businessRows] = await connection.query(
      'SELECT business_id FROM businesses WHERE business_id = ? AND status = "approved"',
      [req.params.id]
    );

    if (businessRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Business not found or not approved" });
    }

    const [reviews] = await connection.query(
      `SELECT r.review_id, r.rating, r.comment, r.created_at, u.first_name, u.last_name
       FROM reviews r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.business_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.id]
    );

    const transformedReviews = reviews.map((review) => ({
      reviewId: review.review_id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.created_at,
      user: {
        firstName: review.first_name,
        lastName: review.last_name,
      },
    }));

    res.json(transformedReviews);
  } catch (error) {
    console.error(
      `DB error fetching reviews for business ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch reviews." });
  }
};

exports.getBusinessCalendar = async (req, res) => {
  try {
    const connection = db.getPromise();
    const businessId = req.params.id;
    const { month, serviceId } = req.query;

    // Fetch business with schedule and exceptions
    const [businessRows] = await connection.query(
      'SELECT business_id, schedule, schedule_exceptions FROM businesses WHERE business_id = ? AND status = "approved"',
      [businessId]
    );

    if (businessRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Business not found or not approved" });
    }

    const business = businessRows[0];

    // Parse business schedule and exceptions using utility functions
    const scheduleUtils = require('../utils/scheduleUtils');
    const schedule = scheduleUtils.parseSchedule(business.schedule);
    const exceptions = scheduleUtils.parseExceptions(business.schedule_exceptions);

    const startDate = new Date(month + "-01");
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const availableDates = [];

    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth(), day);

      // Skip past dates
      if (date < today) {
        continue;
      }

      // Create date string in local timezone (avoid UTC conversion)
      const year = date.getFullYear();
      const monthNum = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${monthNum}-${dayStr}`;

      // Check if business is open on this date (including exceptions)
      const isOpen = scheduleUtils.isBusinessOpenWithExceptions(schedule, date, exceptions);

      if (isOpen) {
        // Get existing appointments for this date
        const [existingAppointments] = await connection.query(
          'SELECT TIME(appointment_datetime) as time FROM appointments WHERE business_id = ? AND DATE(appointment_datetime) = ? AND status != "cancelled"',
          [businessId, dateString]
        );

        const bookedTimes = existingAppointments.map((apt) => apt.time);

        // Generate time slots based on actual business hours (including exception special hours)
        const allSlots = scheduleUtils.generateTimeSlotsWithExceptions(schedule, date, exceptions, 30);

        // Filter out booked slots
        const availableSlots = allSlots.filter(slot => {
          const timeSlotWithSeconds = `${slot}:00`;
          return !bookedTimes.includes(timeSlotWithSeconds);
        });

        availableDates.push({
          date: dateString,
          available: true,
          availableSlots: availableSlots.length
        });
      } else {
        // Business is closed (due to regular schedule or exception)
        availableDates.push({
          date: dateString,
          available: false,
          availableSlots: 0
        });
      }
    }

    res.json({
      businessId: parseInt(businessId),
      serviceId: serviceId ? parseInt(serviceId) : null,
      month,
      availableDates,
    });
  } catch (error) {
    console.error(
      `Error fetching calendar for business ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch calendar availability." });
  }
};

exports.getBusinessAvailability = async (req, res) => {
  try {
    const connection = db.getPromise();
    const businessId = req.params.id;
    const { date, serviceId } = req.query;

    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Fetch business with schedule and exceptions
    const [businessRows] = await connection.query(
      'SELECT business_id, schedule, schedule_exceptions FROM businesses WHERE business_id = ? AND status = "approved"',
      [businessId]
    );

    if (businessRows.length === 0) {
      return res
        .status(404)
        .json({ error: "Business not found or not approved" });
    }

    const business = businessRows[0];

    // Parse business schedule and exceptions using utility functions
    const scheduleUtils = require('../utils/scheduleUtils');
    const schedule = scheduleUtils.parseSchedule(business.schedule);
    const exceptions = scheduleUtils.parseExceptions(business.schedule_exceptions);

    // Parse the date and check for exceptions
    const requestDate = new Date(date);
    const exception = scheduleUtils.getExceptionForDate(exceptions, requestDate);

    // If there's a closure exception, return closed status with exception message
    if (exception && exception.type === 'closure') {
      return res.json({
        businessId: parseInt(businessId),
        serviceId: serviceId ? parseInt(serviceId) : null,
        date,
        availableSlots: [],
        isClosed: true,
        closureReason: 'exception',
        message: exception.title + (exception.description ? ' - ' + exception.description : '')
      });
    }

    // Check if business is open (considering exceptions)
    if (!scheduleUtils.isBusinessOpenWithExceptions(schedule, requestDate, exceptions)) {
      return res.json({
        businessId: parseInt(businessId),
        serviceId: serviceId ? parseInt(serviceId) : null,
        date,
        availableSlots: [],
        isClosed: true,
        message: "העסק סגור ביום זה"
      });
    }

    // Get existing appointments for the date
    const [existingAppointments] = await connection.query(
      'SELECT TIME(appointment_datetime) as time FROM appointments WHERE business_id = ? AND DATE(appointment_datetime) = ? AND status != "cancelled"',
      [businessId, date]
    );

    const bookedTimes = existingAppointments.map((apt) => apt.time);

    // Generate time slots based on actual business hours (including exception special hours)
    const allSlots = scheduleUtils.generateTimeSlotsWithExceptions(schedule, requestDate, exceptions, 30);

    // Filter out booked slots
    const availableSlots = allSlots.filter(slot => {
      const timeSlotWithSeconds = `${slot}:00`;
      return !bookedTimes.includes(timeSlotWithSeconds);
    });

    // Build response with exception info if special hours
    const response = {
      businessId: parseInt(businessId),
      serviceId: serviceId ? parseInt(serviceId) : null,
      date,
      availableSlots,
      isClosed: false
    };

    // Add special hours message if applicable
    if (exception && exception.type === 'special_hours') {
      response.specialHours = true;
      response.message = exception.title + (exception.description ? ' - ' + exception.description : '');
    }

    res.json(response);
  } catch (error) {
    console.error(
      `Error fetching availability for business ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch time slot availability." });
  }
};

exports.createService = async (req, res) => {
  try {
    const connection = db.getPromise();
    const businessId = req.params.id;
    const { name, description, price, duration_minutes } = req.body;

    if (!name || !price || !duration_minutes) {
      return res
        .status(400)
        .json({ error: "Name, price, and duration_minutes are required" });
    }

    const [businessRows] = await connection.query(
      "SELECT business_id, status FROM businesses WHERE business_id = ?",
      [businessId]
    );

    if (businessRows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    if (businessRows[0].status !== "approved") {
      return res
        .status(403)
        .json({
          error: "Business is not approved yet. Cannot create services.",
        });
    }

    const [result] = await connection.query(
      "INSERT INTO services (business_id, name, description, price, duration_minutes) VALUES (?, ?, ?, ?, ?)",
      [businessId, name, description || "", price, duration_minutes]
    );

    res.status(201).json({
      serviceId: result.insertId,
      businessId: parseInt(businessId),
      name,
      description: description || "",
      price,
      durationMinutes: duration_minutes,
      message: "Service created successfully",
    });
  } catch (error) {
    console.error(
      `Error creating service for business ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to create service" });
  }
};

exports.updateService = async (req, res) => {
  try {
    const connection = db.getPromise();
    const businessId = req.params.id;
    const serviceId = req.params.serviceId;
    const { name, description, price, duration_minutes } = req.body;

    if (!name || !price || !duration_minutes) {
      return res
        .status(400)
        .json({ error: "Name, price, and duration_minutes are required" });
    }

    const [serviceRows] = await connection.query(
      "SELECT s.service_id, b.status FROM services s JOIN businesses b ON s.business_id = b.business_id WHERE s.service_id = ? AND s.business_id = ?",
      [serviceId, businessId]
    );

    if (serviceRows.length === 0) {
      return res
        .status(404)
        .json({
          error: "Service not found or doesn't belong to this business",
        });
    }

    if (serviceRows[0].status !== "approved") {
      return res
        .status(403)
        .json({
          error: "Business is not approved yet. Cannot update services.",
        });
    }

    await connection.query(
      "UPDATE services SET name = ?, description = ?, price = ?, duration_minutes = ? WHERE service_id = ? AND business_id = ?",
      [name, description || "", price, duration_minutes, serviceId, businessId]
    );

    res.status(200).json({
      serviceId: parseInt(serviceId),
      businessId: parseInt(businessId),
      name,
      description: description || "",
      price,
      durationMinutes: duration_minutes,
      message: "Service updated successfully",
    });
  } catch (error) {
    console.error(
      `Error updating service ${req.params.serviceId} for business ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to update service" });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const connection = db.getPromise();
    const businessId = req.params.id;
    const serviceId = req.params.serviceId;

    const [serviceRows] = await connection.query(
      "SELECT s.service_id, b.status FROM services s JOIN businesses b ON s.business_id = b.business_id WHERE s.service_id = ? AND s.business_id = ?",
      [serviceId, businessId]
    );

    if (serviceRows.length === 0) {
      return res
        .status(404)
        .json({
          error: "Service not found or doesn't belong to this business",
        });
    }

    if (serviceRows[0].status !== "approved") {
      return res
        .status(403)
        .json({
          error: "Business is not approved yet. Cannot delete services.",
        });
    }

    const [appointmentRows] = await connection.query(
      "SELECT COUNT(*) as count FROM appointments WHERE service_id = ?",
      [serviceId]
    );

    if (appointmentRows[0].count > 0) {
      return res.status(400).json({
        error:
          "Cannot delete service with existing appointments. Please reschedule or cancel appointments first.",
      });
    }

    await connection.query(
      "DELETE FROM services WHERE service_id = ? AND business_id = ?",
      [serviceId, businessId]
    );

    res.status(200).json({
      message: "Service deleted successfully",
      service_id: parseInt(serviceId),
    });
  } catch (error) {
    console.error(
      `Error deleting service ${req.params.serviceId} for business ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to delete service" });
  }
};

exports.getBusinessDashboard = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = db.getPromise();

    // Query 1: Basic business details
    const [businessDetails] = await connection.query(
      "SELECT * FROM businesses WHERE business_id = ?",
      [id]
    );
    if (businessDetails.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    const business = businessDetails[0];

    // חוסמים דשבורד לעסק לא מאושר
    if (business.status !== "approved") {
      return res
        .status(403)
        .json({
          error:
            "Business is not approved yet. Please wait for admin approval.",
        });
    }

    // Query 2: Today's appointments
    const [today_appointments] = await connection.query(
      `SELECT a.*, 
              COALESCE(u.first_name, 'לקוח') as first_name, 
              COALESCE(u.last_name, 'לא ידוע') as last_name, 
              COALESCE(s.name, 'שירות לא ידוע') as service_name, 
              COALESCE(s.price, 0) as price
       FROM appointments a
       LEFT JOIN users u ON a.customer_id = u.user_id
       LEFT JOIN services s ON a.service_id = s.service_id AND s.business_id = a.business_id
       WHERE a.business_id = ? AND DATE(a.appointment_datetime) = CURDATE()
       ORDER BY a.appointment_datetime ASC`,
      [id]
    );

    // If no appointments today, let's get upcoming appointments within 7 days as fallback
    let upcoming_appointments = [];
    if (today_appointments.length === 0) {
      const [upcoming] = await connection.query(
        `SELECT a.*, 
                COALESCE(u.first_name, 'לקוח') as first_name, 
                COALESCE(u.last_name, 'לא ידוע') as last_name, 
                COALESCE(s.name, 'שירות לא ידוע') as service_name, 
                COALESCE(s.price, 0) as price
         FROM appointments a
         LEFT JOIN users u ON a.customer_id = u.user_id
         LEFT JOIN services s ON a.service_id = s.service_id AND s.business_id = a.business_id
         WHERE a.business_id = ? 
         AND a.appointment_datetime >= CURDATE()
         AND a.appointment_datetime <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
         AND a.status IN ('pending', 'confirmed')
         ORDER BY a.appointment_datetime ASC
         LIMIT 10`,
        [id]
      );
      upcoming_appointments = upcoming;
    }

    // Query 3: Pending appointments
    const [pending_appointments] = await connection.query(
      `SELECT a.*, 
                COALESCE(u.first_name, 'לקוח') as first_name, 
                COALESCE(u.last_name, 'לא ידוע') as last_name, 
                COALESCE(s.name, 'שירות לא ידוע') as service_name, 
                COALESCE(s.price, 0) as price
         FROM appointments a
         LEFT JOIN users u ON a.customer_id = u.user_id
         LEFT JOIN services s ON a.service_id = s.service_id AND s.business_id = a.business_id
         WHERE a.business_id = ? AND a.status = 'pending'
         ORDER BY a.appointment_datetime ASC`,
      [id]
    );

    // --- NEW QUERIES & LOGIC START ---

    // Query 4: Analytics - Revenue
    const [revenueData] = await connection.query(
      `SELECT 
        SUM(CASE WHEN a.appointment_datetime >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN s.price ELSE 0 END) as monthlyRevenue,
        SUM(CASE WHEN a.appointment_datetime >= DATE_SUB(NOW(), INTERVAL 1 WEEK) THEN s.price ELSE 0 END) as weeklyRevenue
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       WHERE a.business_id = ? AND a.status = 'completed'`,
      [id]
    );

    // Query 5: Analytics - New Clients
    const [newClientsData] = await connection.query(
      `SELECT COUNT(DISTINCT customer_id) as newClientsThisMonth
       FROM appointments
       WHERE business_id = ? AND appointment_datetime >= DATE_FORMAT(NOW(), '%Y-%m-01')`,
      [id]
    );

    // Query 6: Analytics - Daily revenue for the last 7 days
    const [dailyRevenueLast7DaysRaw] = await connection.query(
      `SELECT DATE(a.appointment_datetime) as date, SUM(s.price) as revenue
       FROM appointments a
       JOIN services s ON a.service_id = s.service_id
       WHERE a.business_id = ? AND a.status = 'completed' AND a.appointment_datetime >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(a.appointment_datetime)
       ORDER BY date ASC`,
      [id]
    );

    // Convert revenue from Decimal string to number
    const dailyRevenueLast7Days = dailyRevenueLast7DaysRaw.map((row) => ({
      date: row.date,
      revenue: parseFloat(row.revenue) || 0,
    }));

    // Query 7: Service Performance (existing logic, slightly adapted)
    const [servicePerformance] = await connection.query(
      `SELECT s.name, COUNT(a.appointment_id) as bookingCount, SUM(s.price) as serviceRevenue
         FROM services s
         LEFT JOIN appointments a ON s.service_id = a.service_id AND a.status = 'completed'
         WHERE s.business_id = ?
         GROUP BY s.service_id
         ORDER BY serviceRevenue DESC`,
      [id]
    );

    // Query 8: Activity Feed - Appointments
    const [appointmentActivities] = await connection.query(
      `SELECT 'new_appointment' as type, u.first_name as user, s.name as service, a.appointment_datetime as time
         FROM appointments a
         JOIN users u ON a.customer_id = u.user_id
         JOIN services s ON a.service_id = s.service_id
         WHERE a.business_id = ?
         ORDER BY a.appointment_datetime DESC
         LIMIT 5`,
      [id]
    );

    // Query 9: Activity Feed - Reviews
    const [reviewActivities] = await connection.query(
      `SELECT 'new_review' as type, u.first_name as user, r.rating, r.created_at as time
         FROM reviews r
         JOIN users u ON r.customer_id = u.user_id
         WHERE r.business_id = ?
         ORDER BY r.created_at DESC
         LIMIT 5`,
      [id]
    );

    // Combine and sort activities
    const activityFeed = [...appointmentActivities, ...reviewActivities]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5); // Limit to 5 most recent activities overall

    // --- NEW QUERIES & LOGIC END ---

    const responseData = {
      business: business,
      analytics: {
        monthlyRevenue: revenueData[0].monthlyRevenue || 0,
        weeklyRevenue: revenueData[0].weeklyRevenue || 0,
        newClientsThisMonth: newClientsData[0].newClientsThisMonth || 0,
        dailyRevenueLast7Days: dailyRevenueLast7Days,
        servicePerformance: servicePerformance,
        pendingAppointments: pending_appointments.length, // Use length of fetched array
      },
      pending_appointments: pending_appointments,
      today_appointments:
        today_appointments.length > 0
          ? today_appointments
          : upcoming_appointments,
      upcoming_appointments: upcoming_appointments,
      activityFeed: activityFeed,
      // Debug info
      debug_info: {
        today_count: today_appointments.length,
        upcoming_count: upcoming_appointments.length,
        using_upcoming_fallback:
          today_appointments.length === 0 && upcoming_appointments.length > 0,
      },
    };

    res.json(responseData);
  } catch (error) {
    console.error(
      `DB error fetching dashboard data for business ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
};

exports.getBusinessDashboardAnalytics = async (req, res) => {
  try {
    const connection = db.getPromise();
    const businessId = req.params.id;

    const [businessRows] = await connection.query(
      "SELECT * FROM businesses WHERE business_id = ?",
      [businessId]
    );

    if (businessRows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    const business = businessRows[0];

    if (business.status !== "approved") {
      return res
        .status(403)
        .json({
          error:
            "Business is not approved yet. Please wait for admin approval.",
        });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);

    const [appointmentStats] = await connection.query(
      `
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as approved_appointments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_appointments,
        COUNT(CASE WHEN status = 'cancelled_by_user' OR status = 'cancelled_by_business' THEN 1 END) as cancelled_appointments,
        COUNT(CASE WHEN DATE_FORMAT(appointment_datetime, '%Y-%m') = ? THEN 1 END) as monthly_appointments,
        COUNT(CASE WHEN appointment_datetime >= CURDATE() AND appointment_datetime < DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as weekly_appointments
      FROM appointments 
      WHERE business_id = ?
    `,
      [currentMonth, businessId]
    );

    const [revenueStats] = await connection.query(
      `
      SELECT 
        COALESCE(SUM(CASE WHEN a.status = 'completed' THEN s.price END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN a.status = 'completed' AND DATE_FORMAT(a.appointment_datetime, '%Y-%m') = ? THEN s.price END), 0) as monthly_revenue,
        COALESCE(AVG(CASE WHEN a.status = 'completed' THEN s.price END), 0) as average_service_price
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.business_id = ?
    `,
      [currentMonth, businessId]
    );

    const [recentAppointments] = await connection.query(
      `
      SELECT 
        a.appointment_id,
        a.appointment_datetime,
        a.status,
        a.notes,
        u.first_name,
        u.last_name, 
        u.phone,
        s.name as service_name,
        s.price,
        s.duration_minutes
      FROM appointments a
      LEFT JOIN users u ON a.customer_id = u.user_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.business_id = ?
      ORDER BY a.appointment_datetime DESC
      LIMIT 10
    `,
      [businessId]
    );

    const [monthlyTrends] = await connection.query(
      `
      SELECT 
        DATE_FORMAT(appointment_datetime, '%Y-%m') as month,
        COUNT(*) as appointment_count,
        COALESCE(SUM(CASE WHEN a.status = 'completed' THEN s.price END), 0) as revenue
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.business_id = ? 
      AND appointment_datetime >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(appointment_datetime, '%Y-%m')
      ORDER BY month ASC
    `,
      [businessId]
    );

    const [serviceStats] = await connection.query(
      `
      SELECT 
        s.name as service_name,
        s.service_id,
        COUNT(a.appointment_id) as booking_count,
        COALESCE(SUM(CASE WHEN a.status = 'completed' THEN s.price END), 0) as service_revenue
      FROM services s
      LEFT JOIN appointments a ON s.service_id = a.service_id
      WHERE s.business_id = ?
      GROUP BY s.service_id, s.name
      ORDER BY booking_count DESC
    `,
      [businessId]
    );

    const [todayAppointments] = await connection.query(
      `
      SELECT 
        a.appointment_id,
        a.appointment_datetime,
        a.status,
        u.first_name,
        u.last_name,
        s.name as service_name,
        s.duration_minutes
      FROM appointments a
      LEFT JOIN users u ON a.customer_id = u.user_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.business_id = ? 
      AND DATE(a.appointment_datetime) = CURDATE()
      ORDER BY a.appointment_datetime ASC
    `,
      [businessId]
    );

    const dashboardData = {
      business: {
        businessId: business.business_id,
        ownerId: business.owner_id,
        name: business.name,
        category: business.category,
        description: business.description,
        location: business.location,
        photos: business.photos,
        schedule: business.schedule,
        createdAt: business.created_at,
        totalServices: serviceStats.length,
      },
      analytics: {
        totalAppointments: appointmentStats[0].total_appointments || 0,
        approvedAppointments: appointmentStats[0].approved_appointments || 0,
        pendingAppointments: appointmentStats[0].pending_appointments || 0,
        cancelledAppointments: appointmentStats[0].cancelled_appointments || 0,
        monthlyAppointments: appointmentStats[0].monthly_appointments || 0,
        weeklyAppointments: appointmentStats[0].weekly_appointments || 0,
        totalRevenue: parseFloat(revenueStats[0].total_revenue) || 0,
        monthlyRevenue: parseFloat(revenueStats[0].monthly_revenue) || 0,
        averageServicePrice:
          parseFloat(revenueStats[0].average_service_price) || 0,
        monthlyTrends: monthlyTrends,
        serviceStats: serviceStats.map((stat) => ({
          serviceName: stat.service_name,
          serviceId: stat.service_id,
          bookingCount: stat.booking_count,
          serviceRevenue: stat.service_revenue,
        })),
      },
      recentAppointments: recentAppointments.map((apt) => ({
        appointmentId: apt.appointment_id,
        appointmentDatetime: apt.appointment_datetime,
        status: apt.status,
        firstName: apt.first_name,
        lastName: apt.last_name,
        serviceName: apt.service_name,
        durationMinutes: apt.duration_minutes,
      })),
      todayAppointments: todayAppointments.map((apt) => ({
        appointmentId: apt.appointment_id,
        appointmentDatetime: apt.appointment_datetime,
        status: apt.status,
        firstName: apt.first_name,
        lastName: apt.last_name,
        serviceName: apt.service_name,
        durationMinutes: apt.duration_minutes,
      })),
      notifications: {
        pendingCount: appointmentStats[0].pending_appointments || 0,
        todayCount: todayAppointments.length || 0,
      },
    };

    res.json(dashboardData);
  } catch (error) {
    console.error(
      `DB error fetching dashboard data for business ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
};

exports.getBusinessAppointments = async (req, res) => {
  try {
    const connection = db.getPromise();
    const businessId = req.params.id;

    // Verify business exists & approved
    const [businessRows] = await connection.query(
      "SELECT business_id, status FROM businesses WHERE business_id = ?",
      [businessId]
    );

    if (businessRows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    if (businessRows[0].status !== "approved") {
      return res.status(403).json({ error: "Business is not approved yet." });
    }

    // Get all appointments with customer and service details
    const [appointments] = await connection.query(
      `SELECT
        a.appointment_id,
        a.appointment_datetime,
        a.status,
        a.notes,
        COALESCE(u.first_name, 'לקוח') as first_name,
        COALESCE(u.last_name, 'לא ידוע') as last_name,
        COALESCE(u.phone, '') as customer_phone,
        COALESCE(s.name, 'שירות לא ידוע') as service_name,
        COALESCE(s.price, 0) as price,
        COALESCE(s.duration_minutes, 0) as duration_minutes
      FROM appointments a
      LEFT JOIN users u ON a.customer_id = u.user_id
      LEFT JOIN services s ON a.service_id = s.service_id AND s.business_id = a.business_id
      WHERE a.business_id = ?
      ORDER BY a.appointment_datetime DESC`,
      [businessId]
    );

    res.json(appointments);
  } catch (error) {
    console.error(
      `Error fetching appointments for business ${req.params.id}:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch appointments." });
  }
};
