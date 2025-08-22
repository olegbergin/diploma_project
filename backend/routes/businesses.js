// backend/routes/businesses.js
const express = require("express");
const router = express.Router();

// --- CHANGE 1: Use the promise-based connection ---
// Get the promise-based connection object for async/await support.
const db = require("../dbSingleton").getPromise();

/* ───────────────────────────────
   1. Create a new business (POST /api/businesses)
   Refactored with async/await.
   ─────────────────────────────── */
router.post("/", async (req, res) => { // <-- Add async
  const {
    name, category, description, phone, email, address, image_url = "", opening_hours = "",
  } = req.body;

  const sql = `
    INSERT INTO businesses (name, category, description, phone, email, address, image_url, opening_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [name, category, description, phone, email, address, image_url, opening_hours];

  try {
    // --- CHANGE 2: Use await and a try...catch block ---
    const [result] = await db.query(sql, params); // <-- Use await
    res.status(201).json({ id: result.insertId, message: "Business created" });
  } catch (err) {
    console.error("DB error creating business:", err);
    res.status(500).json({ error: "Failed to create business." });
  }
});

/* ───────────────────────────────
   2. Get all businesses (GET /api/businesses)
   Refactored with async/await.
   ─────────────────────────────── */
/* ───────────────────────────────
   Get unique categories (GET /api/businesses/categories)
   Must come before /:id route to avoid conflicts
   ─────────────────────────────── */
router.get("/categories", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT DISTINCT category FROM businesses WHERE category IS NOT NULL AND category != '' ORDER BY category");
    const categories = rows.map(row => row.category);
    res.json(categories);
  } catch (err) {
    console.error("DB error fetching categories:", err);
    res.status(500).json({ error: "Failed to fetch categories." });
  }
});

router.get("/", async (_req, res) => { // <-- Add async
  try {
    const [rows] = await db.query("SELECT * FROM businesses"); // <-- Use await
    res.json(rows);
  } catch (err) {
    console.error("DB error fetching all businesses:", err);
    res.status(500).json({ error: "Failed to fetch businesses." });
  }
});

/* ───────────────────────────────
   3. Get a single business by ID (GET /api/businesses/:id)
   Refactored with async/await.
   ─────────────────────────────── */
router.get("/:id", async (req, res) => { // <-- Add async
  const businessSql = "SELECT * FROM businesses WHERE business_id = ?";
  const servicesSql = "SELECT * FROM services WHERE business_id = ?";
  const params = [req.params.id];

  try {
    // Get business info
    const [businessRows] = await db.query(businessSql, params);
    
    // Check if a business was found
    if (businessRows.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    // Get services for this business
    const [servicesRows] = await db.query(servicesSql, params);
    
    // Combine business info with services
    const business = businessRows[0];
    const transformedBusiness = {
      businessId: business.business_id,
      ownerId: business.owner_id,
      name: business.name,
      category: business.category,
      description: business.description,
      location: business.location,
      photos: business.photos,
      schedule: business.schedule,
      createdAt: business.created_at,
      services: servicesRows.map(service => ({
        serviceId: service.service_id,
        businessId: service.business_id,
        name: service.name,
        price: service.price,
        durationMinutes: service.duration_minutes,
        description: service.description,
        createdAt: service.created_at,
        category: service.category,
        isActive: service.is_active
      }))
    };
    
    res.json(transformedBusiness);
  } catch (err) {
    console.error(`DB error fetching business with id ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to fetch business details." });
  }
});

/* ───────────────────────────────
   4. Update a business (PUT /api/businesses/:id)
   Refactored with async/await.
   ─────────────────────────────── */
router.put("/:id", async (req, res) => { // <-- Add async
  const {
    name, category, description, phone, email, address, image_url = "", opening_hours = "",
  } = req.body;

  const sql = `
    UPDATE businesses SET name = ?, category = ?, description = ?, phone = ?, email = ?,
    address = ?, image_url = ?, opening_hours = ?
    WHERE business_id = ?
  `;
  const params = [name, category, description, phone, email, address, image_url, opening_hours, req.params.id];

  try {
    const [result] = await db.query(sql, params); // <-- Use await
    
    // Check if any row was actually updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    res.json({ message: "Business updated successfully" });
  } catch (err) {
    console.error(`DB error updating business with id ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to update business." });
  }
});

/* ───────────────────────────────
   5. Get services for a specific business (GET /api/businesses/:id/services)
   Returns array of services for the business
   ─────────────────────────────── */
router.get("/:id/services", async (req, res) => {
  try {
    // First check if business exists
    const [businessRows] = await db.query(
      "SELECT business_id FROM businesses WHERE business_id = ?",
      [req.params.id]
    );

    if (businessRows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Fetch services with correct column mapping
    const [services] = await db.query(
      "SELECT service_id, business_id, name, description, price, duration_minutes, category, is_active, created_at FROM services WHERE business_id = ? ORDER BY name ASC",
      [req.params.id]
    );

    const transformedServices = services.map(service => ({
      serviceId: service.service_id,
      businessId: service.business_id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration_minutes,
      durationMinutes: service.duration_minutes,
      category: service.category,
      isActive: service.is_active,
      createdAt: service.created_at
    }));

    res.json(transformedServices);
  } catch (err) {
    console.error(`DB error fetching services for business ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to fetch services." });
  }
});

/* ───────────────────────────────
   6. Get dashboard analytics for a business (GET /api/businesses/:id/dashboard)
   Returns comprehensive dashboard data including analytics, appointments, and stats
   ─────────────────────────────── */
router.get("/:id/dashboard", async (req, res) => {
  try {
    const businessId = req.params.id;
    
    // Check if business exists
    const [businessRows] = await db.query(
      "SELECT * FROM businesses WHERE business_id = ?",
      [businessId]
    );

    if (businessRows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    const business = businessRows[0];

    // Get current month analytics
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Get appointment statistics
    const [appointmentStats] = await db.query(`
      SELECT 
        COUNT(*) as total_appointments,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as approved_appointments,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_appointments,
        COUNT(CASE WHEN status = 'cancelled_by_user' OR status = 'cancelled_by_business' THEN 1 END) as cancelled_appointments,
        COUNT(CASE WHEN DATE_FORMAT(appointment_datetime, '%Y-%m') = ? THEN 1 END) as monthly_appointments,
        COUNT(CASE WHEN appointment_datetime >= CURDATE() AND appointment_datetime < DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as weekly_appointments
      FROM appointments 
      WHERE business_id = ?
    `, [currentMonth, businessId]);

    // Get revenue statistics (assuming appointments have a price from services)
    const [revenueStats] = await db.query(`
      SELECT 
        COALESCE(SUM(CASE WHEN a.status = 'completed' THEN s.price END), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN a.status = 'completed' AND DATE_FORMAT(a.appointment_datetime, '%Y-%m') = ? THEN s.price END), 0) as monthly_revenue,
        COALESCE(AVG(CASE WHEN a.status = 'completed' THEN s.price END), 0) as average_service_price
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.business_id = ?
    `, [currentMonth, businessId]);

    // Get recent appointments with customer and service details
    const [recentAppointments] = await db.query(`
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
    `, [businessId]);

    // Get monthly appointment trends (last 12 months)
    const [monthlyTrends] = await db.query(`
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
    `, [businessId]);

    // Get service popularity
    const [serviceStats] = await db.query(`
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
    `, [businessId]);

    // Get today's appointments
    const [todayAppointments] = await db.query(`
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
    `, [businessId]);

    // Compile dashboard data
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
        totalServices: serviceStats.length
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
        averageServicePrice: parseFloat(revenueStats[0].average_service_price) || 0,
        monthlyTrends: monthlyTrends,
        serviceStats: serviceStats.map(stat => ({
          serviceName: stat.service_name,
          serviceId: stat.service_id,
          bookingCount: stat.booking_count,
          serviceRevenue: stat.service_revenue
        }))
      },
      recentAppointments: recentAppointments.map(apt => ({
        appointmentId: apt.appointment_id,
        appointmentDatetime: apt.appointment_datetime,
        status: apt.status,
        firstName: apt.first_name,
        lastName: apt.last_name,
        serviceName: apt.service_name,
        durationMinutes: apt.duration_minutes
      })),
      todayAppointments: todayAppointments.map(apt => ({
        appointmentId: apt.appointment_id,
        appointmentDatetime: apt.appointment_datetime,
        status: apt.status,
        firstName: apt.first_name,
        lastName: apt.last_name,
        serviceName: apt.service_name,
        durationMinutes: apt.duration_minutes
      })),
      notifications: {
        pendingCount: appointmentStats[0].pending_appointments || 0,
        todayCount: todayAppointments.length || 0
      }
    };

    res.json(dashboardData);
  } catch (err) {
    console.error(`DB error fetching dashboard data for business ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
});

/* ───────────────────────────────
   7. Get calendar availability for a business (GET /api/businesses/:id/calendar)
   Returns available dates for a given month and service
   ─────────────────────────────── */
router.get("/:id/calendar", async (req, res) => {
  try {
    const businessId = req.params.id;
    const { month, serviceId } = req.query;
    
    // Check if business exists
    const [businessRows] = await db.query(
      "SELECT business_id FROM businesses WHERE business_id = ?",
      [businessId]
    );

    if (businessRows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    // For now, return mock availability data
    // In a real implementation, this would check actual appointments and business hours
    const startDate = new Date(month + '-01');
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
    
    const availableDates = [];
    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(startDate.getFullYear(), startDate.getMonth(), day);
      const dayOfWeek = date.getDay();
      
      // Skip past dates and weekends for simplicity
      if (date >= new Date() && dayOfWeek !== 0 && dayOfWeek !== 6) {
        availableDates.push({
          date: date.toISOString().split('T')[0],
          available: true,
          availableSlots: Math.floor(Math.random() * 8) + 2 // 2-10 available slots
        });
      }
    }

    res.json({
      businessId: parseInt(businessId),
      serviceId: serviceId ? parseInt(serviceId) : null,
      month,
      availableDates
    });
  } catch (err) {
    console.error(`Error fetching calendar for business ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to fetch calendar availability." });
  }
});

/* ───────────────────────────────
   8. Get time slot availability for a specific date (GET /api/businesses/:id/availability)
   Returns available time slots for a given date and service
   ─────────────────────────────── */
router.get("/:id/availability", async (req, res) => {
  try {
    const businessId = req.params.id;
    const { date, serviceId } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }

    // Check if business exists
    const [businessRows] = await db.query(
      "SELECT business_id FROM businesses WHERE business_id = ?",
      [businessId]
    );

    if (businessRows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Get existing appointments for the date
    const [existingAppointments] = await db.query(
      "SELECT TIME(appointment_datetime) as time FROM appointments WHERE business_id = ? AND DATE(appointment_datetime) = ? AND status != 'cancelled'",
      [businessId, date]
    );

    const bookedTimes = existingAppointments.map(apt => apt.time);
    
    // Generate available time slots (8 AM to 8 PM, 30-minute intervals)
    const availableSlots = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
        const displayTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        if (!bookedTimes.includes(timeSlot)) {
          availableSlots.push(displayTime);
        }
      }
    }

    res.json({
      businessId: parseInt(businessId),
      serviceId: serviceId ? parseInt(serviceId) : null,
      date,
      availableSlots
    });
  } catch (err) {
    console.error(`Error fetching availability for business ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to fetch time slot availability." });
  }
});

/* ───────────────────────────────
   9. Add a new service to a business (POST /api/businesses/:id/services)
   ─────────────────────────────── */
router.post("/:id/services", async (req, res) => {
  try {
    const businessId = req.params.id;
    const { name, description, price, duration_minutes } = req.body;

    // Validate required fields
    if (!name || !price || !duration_minutes) {
      return res.status(400).json({ error: "Name, price, and duration_minutes are required" });
    }

    // Check if business exists
    const [businessRows] = await db.query(
      "SELECT business_id FROM businesses WHERE business_id = ?",
      [businessId]
    );

    if (businessRows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    // Insert new service
    const [result] = await db.query(
      "INSERT INTO services (business_id, name, description, price, duration_minutes) VALUES (?, ?, ?, ?, ?)",
      [businessId, name, description || '', price, duration_minutes]
    );

    res.status(201).json({
      serviceId: result.insertId,
      businessId: parseInt(businessId),
      name,
      description: description || '',
      price,
      durationMinutes: duration_minutes,
      message: "Service created successfully"
    });

  } catch (err) {
    console.error(`Error creating service for business ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to create service" });
  }
});

/* ───────────────────────────────
   10. Update a service (PUT /api/businesses/:id/services/:serviceId)
   ─────────────────────────────── */
router.put("/:id/services/:serviceId", async (req, res) => {
  try {
    const businessId = req.params.id;
    const serviceId = req.params.serviceId;
    const { name, description, price, duration_minutes } = req.body;

    // Validate required fields
    if (!name || !price || !duration_minutes) {
      return res.status(400).json({ error: "Name, price, and duration_minutes are required" });
    }

    // Check if service exists and belongs to this business
    const [serviceRows] = await db.query(
      "SELECT service_id FROM services WHERE service_id = ? AND business_id = ?",
      [serviceId, businessId]
    );

    if (serviceRows.length === 0) {
      return res.status(404).json({ error: "Service not found or doesn't belong to this business" });
    }

    // Update service
    await db.query(
      "UPDATE services SET name = ?, description = ?, price = ?, duration_minutes = ? WHERE service_id = ? AND business_id = ?",
      [name, description || '', price, duration_minutes, serviceId, businessId]
    );

    res.status(200).json({
      serviceId: parseInt(serviceId),
      businessId: parseInt(businessId),
      name,
      description: description || '',
      price,
      durationMinutes: duration_minutes,
      message: "Service updated successfully"
    });

  } catch (err) {
    console.error(`Error updating service ${req.params.serviceId} for business ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to update service" });
  }
});

/* ───────────────────────────────
   11. Delete a service (DELETE /api/businesses/:id/services/:serviceId)
   ─────────────────────────────── */
router.delete("/:id/services/:serviceId", async (req, res) => {
  try {
    const businessId = req.params.id;
    const serviceId = req.params.serviceId;

    // Check if service exists and belongs to this business
    const [serviceRows] = await db.query(
      "SELECT service_id FROM services WHERE service_id = ? AND business_id = ?",
      [serviceId, businessId]
    );

    if (serviceRows.length === 0) {
      return res.status(404).json({ error: "Service not found or doesn't belong to this business" });
    }

    // Check if service has any appointments
    const [appointmentRows] = await db.query(
      "SELECT COUNT(*) as count FROM appointments WHERE service_id = ?",
      [serviceId]
    );

    if (appointmentRows[0].count > 0) {
      return res.status(400).json({ 
        error: "Cannot delete service with existing appointments. Please reschedule or cancel appointments first." 
      });
    }

    // Delete service
    await db.query(
      "DELETE FROM services WHERE service_id = ? AND business_id = ?",
      [serviceId, businessId]
    );

    res.status(200).json({
      message: "Service deleted successfully",
      service_id: parseInt(serviceId)
    });

  } catch (err) {
    console.error(`Error deleting service ${req.params.serviceId} for business ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to delete service" });
  }
});

module.exports = router;