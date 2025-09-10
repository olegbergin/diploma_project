const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise();

/**
 * GET /api/reviews/reviewable/:userId
 * Get all completed appointments that can be reviewed by a user
 */
router.get("/reviewable/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [appointments] = await db.query(`
      SELECT 
        a.appointment_id,
        a.business_id,
        a.service_id,
        a.appointment_datetime,
        b.name as business_name,
        s.name as service_name,
        s.price,
        s.duration_minutes
      FROM appointments a
      JOIN businesses b ON a.business_id = b.business_id
      JOIN services s ON a.service_id = s.service_id
      LEFT JOIN reviews r ON a.appointment_id = r.appointment_id
      WHERE a.customer_id = ?
        AND a.status = 'completed'
        AND r.review_id IS NULL
        AND a.appointment_datetime >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY a.appointment_datetime DESC
    `, [userId]);

    res.json(appointments.map(apt => ({
      appointmentId: apt.appointment_id,
      businessId: apt.business_id,
      serviceId: apt.service_id,
      appointmentDatetime: apt.appointment_datetime,
      businessName: apt.business_name,
      serviceName: apt.service_name,
      price: apt.price,
      durationMinutes: apt.duration_minutes
    })));
  } catch (error) {
    console.error("Error fetching reviewable appointments:", error);
    res.status(500).json({ error: "Failed to fetch reviewable appointments" });
  }
});

/**
 * POST /api/reviews
 * Submit a review for a completed appointment
 */
router.post("/", async (req, res) => {
  try {
    const {
      appointmentId,
      rating,
      text,
      customerId
    } = req.body;

    // Validation
    const errors = {};
    
    if (!appointmentId || isNaN(parseInt(appointmentId))) {
      errors.appointmentId = "Valid appointment ID is required / נדרש מזהה תור תקין";
    }
    
    if (!rating || rating < 1 || rating > 5) {
      errors.rating = "Rating must be between 1 and 5 / דירוג חייב להיות בין 1 ל-5";
    }
    
    if (!customerId || isNaN(parseInt(customerId))) {
      errors.customerId = "Valid customer ID is required / נדרש מזהה לקוח תקין";
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // Verify appointment exists and is completed by this customer
    const [appointment] = await db.query(`
      SELECT appointment_id, business_id, customer_id, status, appointment_datetime
      FROM appointments 
      WHERE appointment_id = ? AND customer_id = ? AND status = 'completed'
    `, [appointmentId, customerId]);

    if (appointment.length === 0) {
      return res.status(404).json({ 
        errors: { appointmentId: "Appointment not found or not eligible for review / תור לא נמצא או לא זכאי לביקורת" }
      });
    }

    // Check if review already exists
    const [existingReview] = await db.query(`
      SELECT review_id FROM reviews WHERE appointment_id = ?
    `, [appointmentId]);

    if (existingReview.length > 0) {
      return res.status(409).json({ 
        errors: { appointmentId: "Review already exists for this appointment / כבר קיימת ביקורת לתור זה" }
      });
    }

    // Check if appointment is within 30-day review window
    const appointmentDate = new Date(appointment[0].appointment_datetime);
    const daysDiff = (new Date() - appointmentDate) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 30) {
      return res.status(400).json({ 
        errors: { appointmentId: "Review window has expired (30 days) / חלון הביקורת פג (30 יום)" }
      });
    }

    // Create review
    const [result] = await db.query(`
      INSERT INTO reviews (customer_id, business_id, appointment_id, rating, text, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `, [customerId, appointment[0].business_id, appointmentId, rating, text || null]);

    res.status(201).json({
      message: "Review submitted successfully / ביקורת נשלחה בהצלחה",
      reviewId: result.insertId
    });
  } catch (error) {
    console.error("Error creating review:", error);
    res.status(500).json({ error: "Failed to create review / יצירת ביקורת נכשלה" });
  }
});

/**
 * GET /api/reviews/business/:businessId
 * Get all reviews for a business (public endpoint)
 */
router.get("/business/:businessId", async (req, res) => {
  try {
    const { businessId } = req.params;
    const { limit = 20, offset = 0, sortBy = 'newest' } = req.query;

    let orderBy = 'r.created_at DESC';
    if (sortBy === 'rating_high') {
      orderBy = 'r.rating DESC, r.created_at DESC';
    } else if (sortBy === 'rating_low') {
      orderBy = 'r.rating ASC, r.created_at DESC';
    }

    const [reviews] = await db.query(`
      SELECT 
        r.review_id,
        r.rating,
        r.text,
        r.business_response,
        r.response_date,
        r.created_at,
        u.first_name,
        u.last_name,
        s.name as service_name,
        a.appointment_datetime
      FROM reviews r
      JOIN users u ON r.customer_id = u.user_id
      LEFT JOIN appointments a ON r.appointment_id = a.appointment_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE r.business_id = ? AND r.is_hidden = FALSE
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `, [businessId, parseInt(limit), parseInt(offset)]);

    // Get review statistics
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(rating), 2) as average_rating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star
      FROM reviews 
      WHERE business_id = ? AND is_hidden = FALSE
    `, [businessId]);

    res.json({
      reviews: reviews.map(review => ({
        reviewId: review.review_id,
        rating: review.rating,
        text: review.text,
        businessResponse: review.business_response,
        responseDate: review.response_date,
        createdAt: review.created_at,
        customerName: `${review.first_name} ${review.last_name}`,
        serviceName: review.service_name,
        appointmentDate: review.appointment_datetime
      })),
      stats: stats[0] || {
        total_reviews: 0,
        average_rating: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0
      }
    });
  } catch (error) {
    console.error("Error fetching business reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

/**
 * POST /api/reviews/:reviewId/response
 * Business owner responds to a review
 */
router.post("/:reviewId/response", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { businessOwnerId, response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({ 
        errors: { response: "Response text is required / נדרש טקסט תגובה" }
      });
    }

    // Verify the business owner has permission to respond
    const [reviewCheck] = await db.query(`
      SELECT r.review_id, r.business_id, b.owner_id
      FROM reviews r
      JOIN businesses b ON r.business_id = b.business_id
      WHERE r.review_id = ? AND b.owner_id = ?
    `, [reviewId, businessOwnerId]);

    if (reviewCheck.length === 0) {
      return res.status(403).json({ 
        errors: { permission: "Not authorized to respond to this review / אין הרשאה להגיב על ביקורת זו" }
      });
    }

    // Update review with business response
    const [result] = await db.query(`
      UPDATE reviews 
      SET business_response = ?, response_date = NOW(), updated_at = NOW()
      WHERE review_id = ?
    `, [response.trim(), reviewId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Response added successfully / תגובה נוספה בהצלחה" });
  } catch (error) {
    console.error("Error adding business response:", error);
    res.status(500).json({ error: "Failed to add response" });
  }
});

/**
 * POST /api/reviews/:reviewId/report
 * Report a review as inappropriate
 */
router.post("/:reviewId/report", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { reporterId, complaintType, complaintText } = req.body;

    const validComplaintTypes = ['inappropriate', 'fake', 'offensive', 'spam', 'other'];
    
    if (!reporterId || isNaN(parseInt(reporterId))) {
      return res.status(400).json({ 
        errors: { reporterId: "Valid reporter ID is required / נדרש מזהה מדווח תקין" }
      });
    }

    if (!complaintType || !validComplaintTypes.includes(complaintType)) {
      return res.status(400).json({ 
        errors: { complaintType: "Valid complaint type is required / נדרש סוג תלונה תקין" }
      });
    }

    // Check if review exists
    const [reviewExists] = await db.query(`
      SELECT review_id FROM reviews WHERE review_id = ?
    `, [reviewId]);

    if (reviewExists.length === 0) {
      return res.status(404).json({ error: "Review not found / ביקורת לא נמצאה" });
    }

    // Check if user already reported this review
    const [existingComplaint] = await db.query(`
      SELECT complaint_id FROM review_complaints 
      WHERE review_id = ? AND reporter_id = ?
    `, [reviewId, reporterId]);

    if (existingComplaint.length > 0) {
      return res.status(409).json({ 
        error: "You have already reported this review / כבר דיווחת על ביקורת זו" 
      });
    }

    // Create complaint
    await db.query(`
      INSERT INTO review_complaints (review_id, reporter_id, complaint_type, complaint_text, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [reviewId, reporterId, complaintType, complaintText || null]);

    res.status(201).json({ 
      message: "Report submitted successfully / דיווח נשלח בהצלחה" 
    });
  } catch (error) {
    console.error("Error reporting review:", error);
    res.status(500).json({ error: "Failed to submit report" });
  }
});

/**
 * GET /api/reviews/user/:userId
 * Get all reviews written by a user
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const [reviews] = await db.query(`
      SELECT 
        r.review_id,
        r.rating,
        r.text,
        r.business_response,
        r.response_date,
        r.created_at,
        b.name as business_name,
        s.name as service_name,
        a.appointment_datetime
      FROM reviews r
      JOIN businesses b ON r.business_id = b.business_id
      LEFT JOIN appointments a ON r.appointment_id = a.appointment_id
      LEFT JOIN services s ON a.service_id = s.service_id
      WHERE r.customer_id = ? AND r.is_hidden = FALSE
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json(reviews.map(review => ({
      reviewId: review.review_id,
      rating: review.rating,
      text: review.text,
      businessResponse: review.business_response,
      responseDate: review.response_date,
      createdAt: review.created_at,
      businessName: review.business_name,
      serviceName: review.service_name,
      appointmentDate: review.appointment_datetime
    })));
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    res.status(500).json({ error: "Failed to fetch user reviews" });
  }
});

/**
 * PUT /api/reviews/:reviewId
 * Update a review (customer only, within time limit)
 */
router.put("/:reviewId", async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { customerId, rating, text } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        errors: { rating: "Rating must be between 1 and 5 / דירוג חייב להיות בין 1 ל-5" }
      });
    }

    // Verify review ownership and edit window
    const [review] = await db.query(`
      SELECT review_id, customer_id, created_at
      FROM reviews 
      WHERE review_id = ? AND customer_id = ?
    `, [reviewId, customerId]);

    if (review.length === 0) {
      return res.status(404).json({ 
        error: "Review not found or not authorized / ביקורת לא נמצאה או אין הרשאה" 
      });
    }

    // Check if within 24-hour edit window
    const reviewDate = new Date(review[0].created_at);
    const hoursDiff = (new Date() - reviewDate) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      return res.status(400).json({ 
        error: "Review can only be edited within 24 hours / ניתן לערוך ביקורת רק תוך 24 שעות" 
      });
    }

    // Update review
    const [result] = await db.query(`
      UPDATE reviews 
      SET rating = ?, text = ?, updated_at = NOW()
      WHERE review_id = ?
    `, [rating, text || null, reviewId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Review not found" });
    }

    res.json({ message: "Review updated successfully / ביקורת עודכנה בהצלחה" });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({ error: "Failed to update review" });
  }
});

module.exports = router;