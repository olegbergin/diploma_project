const express = require("express");
const router = express.Router();
const businessController = require("../controllers/businessController");
// const reportController = require("../controllers/reportController");


// Get unique categories (must come before /:id route)
router.get("/categories", businessController.getCategories);

// Get individual service details (must come before /:id route)
router.get("/services/:serviceId", async (req, res) => {
  try {
    const db = require('../dbSingleton').getPromise();
    const serviceId = req.params.serviceId;
    
    const [rows] = await db.query(
      'SELECT service_id, business_id, name, description, price, duration_minutes, category, is_active FROM services WHERE service_id = ?',
      [serviceId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }

    const service = rows[0];
    const response = {
      serviceId: service.service_id,
      businessId: service.business_id,
      name: service.name,
      description: service.description,
      price: service.price,
      duration_minutes: service.duration_minutes,
      category: service.category,
      isActive: service.is_active
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service details' });
  }
});

// Get all businesses
router.get("/", businessController.getAllBusinesses);

// Create a new business
router.post("/", businessController.createBusiness);

// === REPORT ROUTES (must come before generic /:id route) ===

// Debug route to test if routes are working
router.get("/:id/reports/test", (req, res) => {
  res.json({ message: "Report routes are working!", businessId: req.params.id });
});

// Generate and download business report
// router.get("/:id/reports/generate", reportController.generateReport);

// Preview report data (JSON) without generating PDF
// router.get("/:id/reports/preview", reportController.previewReport);

// Get available report dates for a business
// router.get("/:id/reports/available-dates", reportController.getAvailableDates);

// Get a single business by ID (with owner contact info, services, and ratings)
router.get("/:id", businessController.getBusinessById);

// Update a business
router.put("/:id", businessController.updateBusiness);

// Delete a business
router.delete("/:id", businessController.deleteBusiness);

// Get services for a specific business
router.get("/:id/services", businessController.getBusinessServices);

// Get reviews for a specific business
router.get("/:id/reviews", businessController.getBusinessReviews);

// Get basic dashboard data for a business
router.get("/:id/dashboard", businessController.getBusinessDashboard);

// Get comprehensive dashboard analytics for a business
router.get("/:id/analytics", businessController.getBusinessDashboardAnalytics);

// Get calendar availability for a business
router.get("/:id/calendar", businessController.getBusinessCalendar);

// Get time slot availability for a specific date
router.get("/:id/availability", businessController.getBusinessAvailability);

// Create a new service for a business
router.post("/:id/services", businessController.createService);

// Update a service
router.put("/:id/services/:serviceId", businessController.updateService);

// Delete a service
router.delete("/:id/services/:serviceId", businessController.deleteService);


module.exports = router;