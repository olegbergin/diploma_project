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
    business.services = servicesRows;
    
    res.json(business); // Send the business with services
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
      "SELECT service_id, name, description, price, duration_minutes as duration FROM services WHERE business_id = ? ORDER BY name ASC",
      [req.params.id]
    );

    res.json(services);
  } catch (err) {
    console.error(`DB error fetching services for business ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to fetch services." });
  }
});

module.exports = router;