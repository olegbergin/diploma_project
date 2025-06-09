// backend/routes/businesses.js
const express = require("express");
const router = express.Router();

// Get the database connection object once
const db = require("../dbSingleton").getConnection();

/* ───────────────────────────────
   1. יצירת עסק חדש  (POST /api/businesses)
   ─────────────────────────────── */
router.post("/", (req, res) => {
  const {
    name,
    category,
    description,
    phone,
    email,
    address,
    image_url = "",
    opening_hours = "",
  } = req.body;

  const sql = `
    INSERT INTO businesses (name, category, description, phone, email, address, image_url, opening_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    name,
    category,
    description,
    phone,
    email,
    address,
    image_url,
    opening_hours,
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("DB error creating business:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.status(201).json({ id: result.insertId, message: "Business created" });
  });
});

/* ───────────────────────────────
   2. שליפת כל העסקים  (GET /api/businesses)
   ─────────────────────────────── */
router.get("/", (_req, res) => {
  db.query("SELECT * FROM businesses", (err, rows) => {
    if (err) {
      console.error("DB error fetching all businesses:", err);
      return res.status(500).json({ error: "DB error" });
    }
    res.json(rows);
  });
});

/* ───────────────────────────────
   3. שליפת עסק יחיד  (GET /api/businesses/:id)
   ─────────────────────────────── */
router.get("/:id", (req, res) => {
  const sql = "SELECT * FROM businesses WHERE business_id = ?";
  const params = [req.params.id];

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error(
        `DB error fetching business with id ${req.params.id}:`,
        err
      );
      return res.status(500).json({ error: "DB error" });
    }
    if (!rows.length) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(rows[0]);
  });
});

/* ───────────────────────────────
   4. עדכון עסק  (PUT /api/businesses/:id)
   ─────────────────────────────── */
router.put("/:id", (req, res) => {
  const {
    name,
    category,
    description,
    phone,
    email,
    address,
    image_url = "",
    opening_hours = "",
  } = req.body;

  const sql = `
    UPDATE businesses SET name = ?, category = ?, description = ?, phone = ?, email = ?,
    address = ?, image_url = ?, opening_hours = ?
    WHERE business_id = ?
  `;
  const params = [
    name,
    category,
    description,
    phone,
    email,
    address,
    image_url,
    opening_hours,
    req.params.id,
  ];

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error(
        `DB error updating business with id ${req.params.id}:`,
        err
      );
      return res.status(500).json({ error: "DB error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json({ message: "Business updated" });
  });
});

module.exports = router;
