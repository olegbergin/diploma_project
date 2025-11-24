// ------------------------------------------------------------
// User routes – פעולות פרופיל משתמש (קריאה, עדכון, סיסמה, מועדפים)
// ------------------------------------------------------------
const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise();
const bcrypt = require("bcryptjs");

// ------------------------------------------------------------
// שליפת פרטי משתמש (ללא סיסמה, כולל תמונה, כולל מיפוי avatarUrl)
// GET /api/users/:id
router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const sql =
      "SELECT user_id, first_name, last_name, email, phone, role FROM users WHERE user_id = ?";
    const [rows] = await db.query(sql, [userId]);

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = rows[0];
    const response = {
      userId: user.user_id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: null, // No avatar support in current DB schema
    };
    res.json(response);
  } catch (err) {
    console.error('Error in GET /users/:id:', err);
    res.status(500).json({ error: "Failed to fetch user details." });
  }
});

// ------------------------------------------------------------
// עדכון פרטי משתמש (כולל תמונה)
// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, email, phone } = req.body;
  
  // Validation
  const errors = {};
  
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
    errors.firstName = "שם פרטי נדרש ויש להכיל לפחות 2 תווים / First name required, minimum 2 characters";
  }
  
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
    errors.lastName = "שם משפחה נדרש ויש להכיל לפחות 2 תווים / Last name required, minimum 2 characters";
  }
  
  if (!email || typeof email !== 'string') {
    errors.email = "אימייל נדרש / Email is required";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      errors.email = "כתובת אימייל לא תקינה / Invalid email address";
    }
  }
  
  if (phone && (typeof phone !== 'string' || !/^[0-9+\-\s()]{9,}$/.test(phone.trim()))) {
    errors.phone = "מספר טלפון לא תקין / Invalid phone number";
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  try {
    // Check if user exists
    const [existingUser] = await db.query("SELECT user_id FROM users WHERE user_id = ?", [userId]);
    if (existingUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Check if email is already taken by another user
    const [emailCheck] = await db.query(
      "SELECT user_id FROM users WHERE email = ? AND user_id != ?", 
      [email.trim(), userId]
    );
    if (emailCheck.length > 0) {
      return res.status(400).json({ errors: { email: "אימייל כבר קיים במערכת / Email already exists" } });
    }
    
    await db.query(
      "UPDATE users SET first_name=?, last_name=?, email=?, phone=? WHERE user_id=?",
      [firstName.trim(), lastName.trim(), email.trim(), phone ? phone.trim() : null, userId]
    );
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).json({ error: "Update failed" });
  }
});

// ------------------------------------------------------------
// שינוי סיסמה של משתמש
// POST /api/users/:id/change-password
router.post("/:id/change-password", async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;
  
  // Validation
  const errors = {};
  
  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.currentPassword = "יש למלא סיסמה נוכחית / Current password required";
  }
  
  if (!newPassword || typeof newPassword !== 'string') {
    errors.newPassword = "יש למלא סיסמה חדשה / New password required";
  } else {
    // Password validation using same rules as registration
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/;
    if (!passwordRegex.test(newPassword)) {
      errors.newPassword = "הסיסמה חייבת להכיל 3-8 תווים עם לפחות אות אחת וספרה אחת / Password must be 3-8 characters long and contain at least one letter and one number";
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  try {
    // בדיקת סיסמה קיימת
    const [rows] = await db.query(
      "SELECT password_hash FROM users WHERE user_id = ?",
      [userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    
    const isMatch = await bcrypt.compare(
      currentPassword,
      rows[0].password_hash
    );
    if (!isMatch)
      return res.status(400).json({ 
        errors: { currentPassword: "סיסמה נוכחית לא נכונה / Current password is incorrect" }
      });

    // עדכון סיסמה
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [
      hash,
      userId,
    ]);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// ------------------------------------------------------------
// שליפת רשימת עסקים שאהבתי (מועדפים)
// GET /api/users/:id/favorites
router.get("/:id/favorites", async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.query(
      `SELECT b.business_id, b.name AS name, b.photos AS image_url
        FROM user_favorites f
        JOIN businesses b ON f.business_id = b.business_id
        WHERE f.user_id = ?`,
      [userId]
    );
    
    const favorites = rows.map(row => ({
      businessId: row.business_id,
      name: row.name,
      imageUrl: row.image_url
    }));
    
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: "Failed to get favorites" });
  }
});

// ------------------------------------------------------------
// הוספת עסק למועדפים
// POST /api/users/:id/favorites
router.post("/:id/favorites", async (req, res) => {
  const userId = req.params.id;
  const { businessId } = req.body;
  try {
    await db.query(
      "INSERT IGNORE INTO user_favorites (user_id, business_id) VALUES (?, ?)",
      [userId, businessId]
    );
    res.json({ message: "Added to favorites" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// ------------------------------------------------------------
// הסרת עסק מהמועדפים
// DELETE /api/users/:id/favorites/:businessId
router.delete("/:id/favorites/:businessId", async (req, res) => {
  const { id, businessId } = req.params;
  try {
    await db.query(
      "DELETE FROM user_favorites WHERE user_id = ? AND business_id = ?",
      [id, businessId]
    );
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

// ------------------------------------------------------------
// User Dashboard Data - comprehensive data for user dashboard
// GET /api/users/:id/dashboard
router.get("/:id/dashboard", async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Check if user exists
    const [userRows] = await db.query(
      "SELECT user_id, first_name, last_name, email, phone, role FROM users WHERE user_id = ?",
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userRows[0];

    // Get appointment statistics
    const [appointmentStats] = await db.query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN (status = 'pending' OR status = 'confirmed') AND appointment_datetime >= NOW() THEN 1 END) as upcoming_bookings,
        COUNT(CASE WHEN status = 'completed' AND appointment_datetime < NOW() THEN 1 END) as past_bookings,
        COUNT(CASE WHEN status = 'cancelled_by_user' OR status = 'cancelled_by_business' THEN 1 END) as cancelled_bookings,
        COUNT(CASE WHEN (status = 'pending' OR status = 'confirmed') AND appointment_datetime >= CURDATE() AND appointment_datetime < DATE_ADD(CURDATE(), INTERVAL 14 DAY) THEN 1 END) as bookings_next_two_weeks
      FROM appointments 
      WHERE customer_id = ?
    `, [userId]);

    // Get favorites count
    const [favoritesStats] = await db.query(`
      SELECT COUNT(*) as favorite_businesses
      FROM user_favorites
      WHERE user_id = ?
    `, [userId]);

    // Get average rating given by user (if we have a ratings table)
    // For now, we'll use a placeholder calculation
    const [ratingStats] = await db.query(`
      SELECT 
        COALESCE(AVG(CASE WHEN a.status = 'completed' THEN 4.5 END), 0) as average_rating
      FROM appointments a
      WHERE a.customer_id = ? AND a.status = 'completed'
    `, [userId]);

    // Get recent activities
    const [recentActivities] = await db.query(`
      SELECT 
        'booking' as type,
        CONCAT('תור בעסק ', b.name) as title,
        CONCAT('תור ב', s.name, ' בתאריך ', DATE_FORMAT(a.appointment_datetime, '%d/%m/%Y'), ' בשעה ', DATE_FORMAT(a.appointment_datetime, '%H:%i')) as description,
        a.appointment_datetime as activity_date,
        a.status,
        b.name as business_name,
        '📅' as icon
      FROM appointments a
      LEFT JOIN businesses b ON a.business_id = b.business_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.customer_id = ?
      ORDER BY a.appointment_datetime DESC
      LIMIT 10
    `, [userId]);

    // Get detailed favorites with business info
    const [detailedFavorites] = await db.query(`
      SELECT 
        b.business_id,
        b.name,
        b.category,
        b.description,
        b.location,
        b.photos,
        b.schedule,
        f.created_at as favorited_date,
        (SELECT COUNT(*) FROM appointments WHERE customer_id = ? AND business_id = b.business_id AND status = 'completed') as visit_count,
        (SELECT MAX(appointment_datetime) FROM appointments WHERE customer_id = ? AND business_id = b.business_id AND status = 'completed') as last_visit
      FROM user_favorites f
      JOIN businesses b ON f.business_id = b.business_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [userId, userId, userId]);

    // Get upcoming appointments with full details
    const [upcomingAppointments] = await db.query(`
      SELECT 
        a.appointment_id,
        a.appointment_datetime,
        a.status,
        a.notes,
        b.name as business_name,
        b.location as business_address,
        b.photos as business_image,
        s.name as service_name,
        s.price,
        s.duration_minutes
      FROM appointments a
      LEFT JOIN businesses b ON a.business_id = b.business_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.customer_id = ? 
      AND (a.status = 'pending' OR a.status = 'confirmed') 
      AND a.appointment_datetime >= NOW()
      ORDER BY a.appointment_datetime ASC
      LIMIT 5
    `, [userId]);

    // Get past appointments with ratings (for history)
    const [pastAppointments] = await db.query(`
      SELECT 
        a.appointment_id,
        a.appointment_datetime,
        a.status,
        b.name as business_name,
        b.location as business_address,
        b.photos as business_image,
        s.name as service_name,
        s.price,
        s.duration_minutes
      FROM appointments a
      LEFT JOIN businesses b ON a.business_id = b.business_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE a.customer_id = ? 
      AND (a.status = 'completed' OR a.status = 'not_arrived')
      AND a.appointment_datetime < NOW()
      ORDER BY a.appointment_datetime DESC
      LIMIT 10
    `, [userId]);

    // Compile dashboard data
    const dashboardData = {
      user: {
        userId: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: null // No avatar support in current DB schema
      },
      totalBookings: appointmentStats[0].total_bookings || 0,
      upcomingBookings: appointmentStats[0].upcoming_bookings || 0,
      pastBookings: appointmentStats[0].past_bookings || 0,
      cancelledBookings: appointmentStats[0].cancelled_bookings || 0,
      bookingsNextTwoWeeks: appointmentStats[0].bookings_next_two_weeks || 0,
      favoriteBusinesses: favoritesStats[0].favorite_businesses || 0,
      averageRating: parseFloat(ratingStats[0].average_rating) || 4.5,
      recentActivities: recentActivities.map(activity => ({
        id: Math.random().toString(36).substr(2, 9),
        type: activity.type,
        title: activity.title,
        description: activity.description,
        time: formatTimeAgo(activity.activity_date),
        icon: activity.icon,
        status: activity.status,
        business: activity.business_name
      })),
      favorites: detailedFavorites.map(fav => ({
        businessId: fav.business_id,
        name: fav.name,
        category: fav.category,
        address: fav.location,
        phone: null, // Not available in current schema
        image: fav.photos ? (JSON.parse(fav.photos)[0] || null) : null,
        visitCount: fav.visit_count || 0,
        lastVisit: fav.last_visit,
        favoritedDate: fav.favorited_date
      })),
      upcomingAppointments: upcomingAppointments.map(apt => ({
        appointmentId: apt.appointment_id,
        businessName: apt.business_name,
        serviceName: apt.service_name,
        date: apt.appointment_datetime,
        price: apt.price,
        duration: apt.duration_minutes,
        status: apt.status,
        businessImage: apt.business_image ? (JSON.parse(apt.business_image)[0] || null) : null,
        businessAddress: apt.business_address,
        businessPhone: null // Not available in current schema
      })),
      pastAppointments: pastAppointments.map(apt => ({
        appointmentId: apt.appointment_id,
        businessName: apt.business_name,
        serviceName: apt.service_name,
        date: apt.appointment_datetime,
        price: apt.price,
        duration: apt.duration_minutes,
        status: apt.status,
        businessImage: apt.business_image ? (JSON.parse(apt.business_image)[0] || null) : null
      }))
    };

    res.json(dashboardData);
  } catch (err) {
    console.error(`DB error fetching dashboard data for user ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to fetch dashboard data." });
  }
});

// Helper function to format time ago (can be moved to utils)
function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffHours < 1) return 'לפני פחות משעה';
  if (diffHours < 24) return `לפני ${diffHours} שעות`;
  if (diffDays < 7) return `לפני ${diffDays} ימים`;
  if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
  return `לפני ${Math.floor(diffDays / 30)} חודשים`;
}

module.exports = router;
