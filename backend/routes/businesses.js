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
  const sql = "SELECT * FROM businesses WHERE business_id = ?";
  const params = [req.params.id];

  try {
    const [rows] = await db.query(sql, params); // <-- Use await
    
    // Check if a business was found
    if (rows.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    
    res.json(rows[0]); // Send the first (and only) result
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

module.exports = router;