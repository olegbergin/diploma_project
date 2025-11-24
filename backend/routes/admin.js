const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise();
const jwt = require("jsonwebtoken");
const adminController = require("../controllers/adminController");

const JWT_SECRET = process.env.JWT_SECRET || "my_name_is_oleg";

/**
 * Middleware:בדיקה שהמשתמש הוא אדמין לפי ה-JWT
 */
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    // { userId, role, iat, exp }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Admin auth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Admin dashboard stats
router.get("/stats", requireAdmin, adminController.getAdminStats);

// Recent activity feed
router.get("/activity", requireAdmin, adminController.getRecentActivity);


/* =======================================================================
   חלק 1 – ניהול תלונות וביקורות (Reviews & Complaints)ך
   ======================================================================= */

/**
 * GET /api/admin/reviews/complaints
 * Get all review complaints for admin moderation
 */
router.get("/reviews/complaints", requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    // Build WHERE clause based on status filter
    const whereClause = status && status !== 'all' ? 'WHERE rc.status = ?' : '';
    const statusParam = status && status !== 'all' ? [status] : [];

    // Get total count
    const [countResult] = await db.query(
      `
      SELECT COUNT(*) as total
      FROM review_complaints rc
      ${whereClause}
    `,
      statusParam
    );

    const [complaints] = await db.query(
      `
      SELECT 
        rc.complaint_id,
        rc.review_id,
        rc.complaint_type,
        rc.complaint_text,
        rc.status,
        rc.admin_notes,
        rc.created_at,
        rc.updated_at,
        r.rating,
        r.text as review_text,
        r.created_at as review_date,
        r.is_hidden,
        r.hidden_reason,
        u_customer.first_name as customer_first_name,
        u_customer.last_name as customer_last_name,
        u_reporter.first_name as reporter_first_name,
        u_reporter.last_name as reporter_last_name,
        b.name as business_name
      FROM review_complaints rc
      JOIN reviews r ON rc.review_id = r.review_id
      JOIN users u_customer ON r.customer_id = u_customer.user_id
      JOIN users u_reporter ON rc.reporter_id = u_reporter.user_id
      JOIN businesses b ON r.business_id = b.business_id
      ${whereClause}
      ORDER BY rc.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...statusParam, parseInt(limit), parseInt(offset)]
    );

    res.json({
      complaints: complaints.map((complaint) => ({
        complaintId: complaint.complaint_id,
        reviewId: complaint.review_id,
        complaintType: complaint.complaint_type,
        complaintText: complaint.complaint_text,
        status: complaint.status,
        adminNotes: complaint.admin_notes,
        createdAt: complaint.created_at,
        updatedAt: complaint.updated_at,
        review: {
          rating: complaint.rating,
          text: complaint.review_text,
          createdAt: complaint.review_date,
          isHidden: complaint.is_hidden,
          hiddenReason: complaint.hidden_reason,
          customerName: `${complaint.customer_first_name} ${complaint.customer_last_name}`,
          businessName: complaint.business_name,
        },
        reporterName: `${complaint.reporter_first_name} ${complaint.reporter_last_name}`,
      })),
      total: countResult[0].total,
    });
  } catch (error) {
    console.error("Error fetching review complaints:", error);
    res.status(500).json({ error: "Failed to fetch complaints" });
  }
});

/**
 * PUT /api/admin/reviews/:reviewId/moderate
 * Moderate a review (hide/unhide)
 */
router.put("/reviews/:reviewId/moderate", requireAdmin, async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { action, reason } = req.body; // action: 'hide' or 'unhide'

    if (!action || !["hide", "unhide"].includes(action)) {
      return res.status(400).json({
        error: "Action must be 'hide' or 'unhide'",
      });
    }

    if (action === "hide" && !reason) {
      return res.status(400).json({
        error: "Reason is required when hiding a review",
      });
    }

    const isHidden = action === "hide";
    const hiddenReason = action === "hide" ? reason : null;

    const [result] = await db.query(
      `
      UPDATE reviews 
      SET is_hidden = ?, hidden_reason = ?, updated_at = NOW()
      WHERE review_id = ?
    `,
      [isHidden, hiddenReason, reviewId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({
      message: `Review ${action}d successfully`,
      reviewId,
      action,
    });
  } catch (error) {
    console.error("Error moderating review:", error);
    res.status(500).json({ error: "Failed to moderate review" });
  }
});

/**
 * PUT /api/admin/complaints/:complaintId/resolve
 * Resolve a review complaint
 */
router.put(
  "/complaints/:complaintId/resolve",
  requireAdmin,
  async (req, res) => {
    try {
      const { complaintId } = req.params;
      const { resolution, adminNotes } = req.body; // resolution: 'resolved' or 'dismissed'

      if (!resolution || !["resolved", "dismissed"].includes(resolution)) {
        return res.status(400).json({
          error: "Resolution must be 'resolved' or 'dismissed'",
        });
      }

      const [result] = await db.query(
        `
      UPDATE review_complaints 
      SET status = ?, admin_notes = ?, updated_at = NOW()
      WHERE complaint_id = ?
    `,
        [resolution, adminNotes || null, complaintId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Complaint not found" });
      }

      res.json({
        message: `Complaint ${resolution} successfully`,
        complaintId,
        resolution,
      });
    } catch (error) {
      console.error("Error resolving complaint:", error);
      res.status(500).json({ error: "Failed to resolve complaint" });
    }
  }
);

/**
 * GET /api/admin/reviews/stats
 * Get review system statistics for admin dashboard
 */
router.get("/reviews/stats", requireAdmin, async (req, res) => {
  try {
    // Get various statistics
    const [reviewStats] = await db.query(`
      SELECT 
        COUNT(*) as total_reviews,
        COUNT(CASE WHEN is_hidden = TRUE THEN 1 END) as hidden_reviews,
        ROUND(AVG(rating), 2) as average_rating,
        COUNT(CASE WHEN business_response IS NOT NULL THEN 1 END) as reviews_with_responses,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as reviews_last_30_days
      FROM reviews
    `);

    const [complaintStats] = await db.query(`
      SELECT 
        COUNT(*) as total_complaints,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_complaints,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_complaints,
        COUNT(CASE WHEN status = 'dismissed' THEN 1 END) as dismissed_complaints,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as complaints_last_7_days
      FROM review_complaints
    `);

    const [businessStats] = await db.query(`
      SELECT 
        b.business_id,
        b.name,
        COUNT(r.review_id) as review_count,
        ROUND(AVG(r.rating), 2) as average_rating,
        COUNT(rc.complaint_id) as complaint_count
      FROM businesses b
      LEFT JOIN reviews r ON b.business_id = r.business_id AND r.is_hidden = FALSE
      LEFT JOIN review_complaints rc ON r.review_id = rc.review_id
      GROUP BY b.business_id, b.name
      HAVING review_count > 0
      ORDER BY complaint_count DESC, review_count DESC
      LIMIT 10
    `);

    res.json({
      reviewStats: reviewStats[0] || {},
      complaintStats: complaintStats[0] || {},
      topBusinesses: businessStats.map((business) => ({
        businessId: business.business_id,
        name: business.name,
        reviewCount: business.review_count,
        averageRating: business.average_rating,
        complaintCount: business.complaint_count,
      })),
    });
  } catch (error) {
    console.error("Error fetching admin review stats:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

/**
 * GET /api/admin/reviews
 * Get all reviews with filtering options
 */
router.get("/reviews", requireAdmin, async (req, res) => {
  try {
    const {
      businessId,
      rating,
      hidden = "all",
      hasComplaints = "all",
      limit = 50,
      offset = 0,
    } = req.query;

    let whereConditions = [];
    let params = [];

    if (businessId) {
      whereConditions.push("r.business_id = ?");
      params.push(businessId);
    }

    if (rating) {
      whereConditions.push("r.rating = ?");
      params.push(rating);
    }

    if (hidden === "true") {
      whereConditions.push("r.is_hidden = TRUE");
    } else if (hidden === "false") {
      whereConditions.push("r.is_hidden = FALSE");
    }

    if (hasComplaints === "true") {
      whereConditions.push("rc.complaint_id IS NOT NULL");
    } else if (hasComplaints === "false") {
      whereConditions.push("rc.complaint_id IS NULL");
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    const [reviews] = await db.query(
      `
      SELECT 
        r.review_id,
        r.rating,
        r.text,
        r.business_response,
        r.response_date,
        r.is_hidden,
        r.hidden_reason,
        r.created_at,
        r.updated_at,
        u.first_name,
        u.last_name,
        b.name as business_name,
        COUNT(rc.complaint_id) as complaint_count
      FROM reviews r
      JOIN users u ON r.customer_id = u.user_id
      JOIN businesses b ON r.business_id = b.business_id
      LEFT JOIN review_complaints rc ON r.review_id = rc.review_id
      ${whereClause}
      GROUP BY r.review_id
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `,
      [...params, parseInt(limit), parseInt(offset)]
    );

    res.json({
      reviews: reviews.map((review) => ({
        reviewId: review.review_id,
        rating: review.rating,
        text: review.text,
        businessResponse: review.business_response,
        responseDate: review.response_date,
        isHidden: review.is_hidden,
        hiddenReason: review.hidden_reason,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
        customerName: `${review.first_name} ${review.last_name}`,
        businessName: review.business_name,
        complaintCount: review.complaint_count,
      })),
    });
  } catch (error) {
    console.error("Error fetching admin reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/* =======================================================================
   חלק 2 – ניהול משתמשים (User Management)
   ======================================================================= */

// רשימת משתמשים עם פילטרים (role, search, pagination)
// GET /api/admin/users
router.get("/users", requireAdmin, adminController.getAllUsers);

// עדכון תפקיד משתמש
// PUT /api/admin/users/:id/role
router.put("/users/:id/role", requireAdmin, adminController.updateUserRole);

// עדכון סטטוס משתמש
// PUT /api/admin/users/:id/status
router.put("/users/:id/status", requireAdmin, adminController.updateUserStatus);

// מחיקת משתמש
// DELETE /api/admin/users/:id
router.delete("/users/:id", requireAdmin, async (req, res) => {
  try {
    const connection = db.getPromise();
    const userId = req.params.id;

    // Check if user exists
    const [user] = await connection.query(
      "SELECT user_id FROM users WHERE user_id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete user
    await connection.query("DELETE FROM users WHERE user_id = ?", [userId]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

/* =======================================================================
   חלק 3 – ניהול עסקים (Business Management) – אישור / דחייה / מחיקה
   משתמש בפונקציות שכבר קיימות אצלך ב-adminController
   ======================================================================= */

// רשימת עסקים עם פילטרים (status, search, pagination)
// GET /api/admin/businesses
router.get("/businesses", requireAdmin, adminController.getAllBusinesses);

// אישור עסק – משנה status ל-'approved'
// PUT /api/admin/businesses/:id/approve
router.put(
  "/businesses/:id/approve",
  requireAdmin,
  adminController.approveBusiness
);

// דחיית עסק – משנה status ל-'rejected'
// PUT /api/admin/businesses/:id/reject
router.put(
  "/businesses/:id/reject",
  requireAdmin,
  adminController.rejectBusiness
);

// מחיקת עסק
// DELETE /api/admin/businesses/:id
router.delete("/businesses/:id", requireAdmin, adminController.deleteBusiness);

module.exports = router;
