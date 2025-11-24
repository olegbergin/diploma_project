const db = require("../dbSingleton");

// Get overall admin statistics
exports.getAdminStats = async (req, res) => {
  try {
    const connection = db.getPromise();

    const [userCount] = await connection.query(
      "SELECT COUNT(*) as total FROM users"
    );

    const [businessCount] = await connection.query(
      "SELECT COUNT(*) as total FROM businesses"
    );

    const [pendingCount] = await connection.query(
      "SELECT COUNT(*) as total FROM businesses WHERE status = 'pending'"
    );

    const [appointmentCount] = await connection.query(
      "SELECT COUNT(*) as total FROM appointments"
    );

    const [todayAppointments] = await connection.query(
      "SELECT COUNT(*) as total FROM appointments WHERE DATE(appointment_datetime) = CURDATE()"
    );

    const [weeklyUsers] = await connection.query(
      "SELECT COUNT(*) as total FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );

    const [monthlyUsers] = await connection.query(
      "SELECT COUNT(*) as total FROM users WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );

    const [weeklyBusinesses] = await connection.query(
      "SELECT COUNT(*) as total FROM businesses WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    );

    const [monthlyBusinesses] = await connection.query(
      "SELECT COUNT(*) as total FROM businesses WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)"
    );

    // Get pending review complaints count
    const [pendingComplaints] = await connection.query(
      "SELECT COUNT(*) as total FROM review_complaints WHERE status = 'pending'"
    );

    res.json({
      totalUsers: userCount[0].total || 0,
      totalBusinesses: businessCount[0].total || 0,
      pendingApprovals: pendingCount[0].total || 0,
      totalAppointments: appointmentCount[0].total || 0,
      todayAppointments: todayAppointments[0].total || 0,
      weeklyNewUsers: weeklyUsers[0].total || 0,
      weeklyNewBusinesses: weeklyBusinesses[0].total || 0,
      monthlyNewUsers: monthlyUsers[0].total || 0,
      monthlyNewBusinesses: monthlyBusinesses[0].total || 0,
      pendingReviewDeletions: pendingComplaints[0].total || 0,
      systemStatus: "operational",
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin statistics" });
  }
};

// Get recent activity feed
exports.getRecentActivity = async (req, res) => {
  try {
    const connection = db.getPromise();
    const limit = parseInt(req.query.limit) || 20;

    const [recentUsers] = await connection.query(
      'SELECT user_id, first_name, last_name, created_at, "user_registration" as type FROM users ORDER BY created_at DESC LIMIT ?',
      [limit]
    );

    const [recentBusinesses] = await connection.query(
      'SELECT business_id, name, created_at, "business_registration" as type FROM businesses ORDER BY created_at DESC LIMIT ?',
      [limit]
    );

    const [recentAppointments] = await connection.query(
      `
      SELECT 
        a.appointment_id,
        a.created_at,
        u.first_name as customer_name,
        b.name as business_name,
        'new_appointment' as type
      FROM appointments a
      JOIN users u ON a.customer_id = u.user_id
      JOIN businesses b ON a.business_id = b.business_id
      ORDER BY a.created_at DESC
      LIMIT ?
    `,
      [limit]
    );

    const allActivities = [
      ...recentUsers.map((u) => ({
        id: u.user_id,
        type: "user_registration",
        message: `משתמש חדש נרשם: ${u.first_name} ${u.last_name}`,
        timestamp: u.created_at,
      })),
      ...recentBusinesses.map((b) => ({
        id: b.business_id,
        type: "business_registration",
        message: `עסק חדש נוסף: ${b.name}`,
        timestamp: b.created_at,
      })),
      ...recentAppointments.map((a) => ({
        id: a.appointment_id,
        type: "new_appointment",
        message: `תור חדש נקבע: ${a.customer_name} אצל ${a.business_name}`,
        timestamp: a.created_at,
      })),
    ];

    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(allActivities.slice(0, limit));
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
};

// Get all users with pagination and filtering
exports.getAllUsers = async (req, res) => {
  try {
    const connection = db.getPromise();
    const { page = 1, limit = 20, search = "", role = "" } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (search) {
      whereClause +=
        " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (role) {
      whereClause += " AND role = ?";
      params.push(role);
    }

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    params.push(parseInt(limit), parseInt(offset));
    const [users] = await connection.query(
      `SELECT 
        user_id,
        first_name,
        last_name,
        email,
        phone,
        role,
        created_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?`,
      params
    );

    res.json({
      users,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Update user status (not supported)
exports.updateUserStatus = async (req, res) => {
  return res.status(400).json({
    error:
      "User status management not available - users table has no status column",
  });
};

// Update user role
exports.updateUserRole = async (req, res) => {
  try {
    const connection = db.getPromise();
    const userId = req.params.id;
    const { role } = req.body;

    if (!["customer", "business", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role value" });
    }

    const [result] = await connection.query(
      "UPDATE users SET role = ? WHERE user_id = ?",
      [role, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
};

// Get all businesses with filtering
exports.getAllBusinesses = async (req, res) => {
  try {
    const connection = db.getPromise();
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
      category = "",
    } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (search) {
      whereClause += " AND (b.name LIKE ? OR b.description LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern);
    }

    if (status) {
      whereClause += " AND b.status = ?";
      params.push(status);
    }

    if (category) {
      whereClause += " AND b.category = ?";
      params.push(category);
    }

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM businesses b ${whereClause}`,
      params
    );

    params.push(parseInt(limit), parseInt(offset));
    const [businesses] = await connection.query(
      `SELECT 
        b.business_id,
        b.name,
        b.category,
        b.description,
        b.location,
        b.status,
        b.created_at,
        u.first_name as owner_first_name,
        u.last_name as owner_last_name,
        u.email as owner_email,
        u.phone as owner_phone
      FROM businesses b
      LEFT JOIN users u ON b.owner_id = u.user_id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT ? OFFSET ?`,
      params
    );

    res.json({
      businesses,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ error: "Failed to fetch businesses" });
  }
};

// Approve a business
exports.approveBusiness = async (req, res) => {
  try {
    const connection = db.getPromise();
    const businessId = req.params.id;

    const [result] = await connection.query(
      "UPDATE businesses SET status = 'approved' WHERE business_id = ?",
      [businessId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.json({ message: "Business approved successfully" });
  } catch (error) {
    console.error("Error approving business:", error);
    res.status(500).json({ error: "Failed to approve business" });
  }
};

// Reject a business
exports.rejectBusiness = async (req, res) => {
  try {
    const connection = db.getPromise();
    const businessId = req.params.id;

    // ✅ אם לא נשלח body – לא יקרוס
    const { reason } = req.body || {};

    const [result] = await connection.query(
      "UPDATE businesses SET status = 'rejected' WHERE business_id = ?",
      [businessId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    res.json({ message: "Business rejected", reason: reason || null });
  } catch (error) {
    console.error("Error rejecting business:", error);
    res.status(500).json({ error: "Failed to reject business" });
  }
};

// Delete a business (with dependencies)
exports.deleteBusiness = async (req, res) => {
  const connection = db.getPromise();
  const businessId = req.params.id;

  try {
    await connection.beginTransaction();

    // 1) למחוק תלונות על ביקורות של העסק
    await connection.query(
      `
      DELETE rc
      FROM review_complaints rc
      JOIN reviews r ON rc.review_id = r.review_id
      WHERE r.business_id = ?
      `,
      [businessId]
    );

    // 2) למחוק ביקורות של העסק
    await connection.query("DELETE FROM reviews WHERE business_id = ?", [
      businessId,
    ]);

    // 3) למחוק תורים של העסק
    await connection.query("DELETE FROM appointments WHERE business_id = ?", [
      businessId,
    ]);

    // 4) למחוק שירותים של העסק (אם קיימים)
    await connection.query("DELETE FROM services WHERE business_id = ?", [
      businessId,
    ]);

    // 5) עכשיו אפשר למחוק את העסק עצמו
    const [result] = await connection.query(
      "DELETE FROM businesses WHERE business_id = ?",
      [businessId]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Business not found" });
    }

    await connection.commit();
    res.json({ message: "Business deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting business:", error);
    res.status(500).json({
      error: "Failed to delete business",
      details: error.message,
    });
  }
};

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const connection = db.getPromise();
    const { page = 1, limit = 20, status = "", date = "" } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = "WHERE 1=1";
    const params = [];

    if (status) {
      whereClause += " AND a.status = ?";
      params.push(status);
    }

    if (date) {
      whereClause += " AND DATE(a.appointment_datetime) = ?";
      params.push(date);
    }

    const [countResult] = await connection.query(
      `SELECT COUNT(*) as total FROM appointments a ${whereClause}`,
      params
    );

    params.push(parseInt(limit), parseInt(offset));
    const [appointments] = await connection.query(
      `SELECT 
        a.appointment_id,
        a.appointment_datetime,
        a.status,
        a.notes,
        a.created_at,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        u.phone as customer_phone,
        b.name as business_name,
        b.location as business_location,
        s.name as service_name,
        s.price as service_price,
        s.duration_minutes
      FROM appointments a
      LEFT JOIN users u ON a.customer_id = u.user_id
      LEFT JOIN businesses b ON a.business_id = b.business_id
      LEFT JOIN services s ON a.service_id = s.service_id
      ${whereClause}
      ORDER BY a.appointment_datetime DESC
      LIMIT ? OFFSET ?`,
      params
    );

    res.json({
      appointments,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

// Update appointment status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const connection = db.getPromise();
    const appointmentId = req.params.id;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "confirmed",
      "completed",
      "cancelled_by_user",
      "cancelled_by_business",
      "not_arrived",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const [result] = await connection.query(
      "UPDATE appointments SET status = ? WHERE appointment_id = ?",
      [status, appointmentId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json({ message: "Appointment status updated successfully" });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({ error: "Failed to update appointment status" });
  }
};

// Get user growth analytics
exports.getUserAnalytics = async (req, res) => {
  try {
    const connection = db.getPromise();
    const { days = 30 } = req.query;

    const [dailyData] = await connection.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [parseInt(days)]
    );

    const [roleDistribution] = await connection.query(
      "SELECT role, COUNT(*) as count FROM users GROUP BY role"
    );

    res.json({
      dailyGrowth: dailyData,
      roleDistribution,
      period: `${days} days`,
    });
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
};

// Get business growth analytics
exports.getBusinessAnalytics = async (req, res) => {
  try {
    const connection = db.getPromise();
    const { days = 30 } = req.query;

    const [dailyData] = await connection.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM businesses
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [parseInt(days)]
    );

    const [categoryDistribution] = await connection.query(
      "SELECT category, COUNT(*) as count FROM businesses GROUP BY category"
    );

    const [statusDistribution] = await connection.query(
      "SELECT status, COUNT(*) as count FROM businesses GROUP BY status"
    );

    res.json({
      dailyGrowth: dailyData,
      categoryDistribution,
      statusDistribution,
      period: `${days} days`,
    });
  } catch (error) {
    console.error("Error fetching business analytics:", error);
    res.status(500).json({ error: "Failed to fetch business analytics" });
  }
};

// Get appointment analytics
exports.getAppointmentAnalytics = async (req, res) => {
  try {
    const connection = db.getPromise();
    const { days = 30 } = req.query;

    const [dailyData] = await connection.query(
      `SELECT 
        DATE(appointment_datetime) as date,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled_by_user' OR status = 'cancelled_by_business' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'not_arrived' THEN 1 ELSE 0 END) as no_show
      FROM appointments
      WHERE appointment_datetime >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(appointment_datetime)
      ORDER BY date ASC`,
      [parseInt(days)]
    );

    const [statusDistribution] = await connection.query(
      "SELECT status, COUNT(*) as count FROM appointments GROUP BY status"
    );

    const [topServices] = await connection.query(
      `SELECT 
        s.name as service_name,
        COUNT(*) as appointment_count
      FROM appointments a
      JOIN services s ON a.service_id = s.service_id
      GROUP BY a.service_id, s.name
      ORDER BY appointment_count DESC
      LIMIT 10`
    );

    res.json({
      dailyAppointments: dailyData,
      statusDistribution,
      topServices,
      period: `${days} days`,
    });
  } catch (error) {
    console.error("Error fetching appointment analytics:", error);
    res.status(500).json({ error: "Failed to fetch appointment analytics" });
  }
};
