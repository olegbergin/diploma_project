// backend/routes/businesses.js
const express = require("express");
const router = express.Router();

/* ───── חיבור לבסיס הנתונים ───── */
const getDb = require("../dbSingleton").getConnection; // ← לשים את הפונקציה, לא התוצאה

/* ───────────────────────────────
   1. יצירת עסק חדש  (POST /api/businesses)
   ─────────────────────────────── */
router.post("/", async (req, res) => {
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
    INSERT INTO businesses
      (name, category, description, phone, email, address, image_url, opening_hours)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    const db = await getDb(); // ← await
    const [result] = await db.query(sql, [
      name,
      category,
      description,
      phone,
      email,
      address,
      image_url,
      opening_hours,
    ]);
    res.status(201).json({ id: result.insertId, message: "Business created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ───────────────────────────────
   2. שליפת כל העסקים  (GET /api/businesses)
   ─────────────────────────────── */
router.get("/", async (_req, res) => {
  try {
    const db = await getDb(); // ← await
    const [rows] = await db.query("SELECT * FROM businesses");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ───────────────────────────────
   3. שליפת עסק יחיד  (GET /api/businesses/:id)
   ─────────────────────────────── */
router.get("/:id", async (req, res) => {
  try {
    const db = await getDb(); // ← await
    const [rows] = await db.query(
      "SELECT * FROM businesses WHERE business_id = ?",
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ message: "Business not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ───────────────────────────────
   4. עדכון עסק  (PUT /api/businesses/:id)
   ─────────────────────────────── */
router.put("/:id", async (req, res) => {
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
    UPDATE businesses
       SET name          = ?,
           category      = ?,
           description   = ?,
           phone         = ?,
           email         = ?,
           address       = ?,
           image_url     = ?,
           opening_hours = ?
     WHERE business_id   = ?
  `;
  try {
    const db = await getDb(); // ← await
    const [result] = await db.query(sql, [
      name,
      category,
      description,
      phone,
      email,
      address,
      image_url,
      opening_hours,
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Business not found" });

    res.json({ message: "Business updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

/* ─────────────────────────────── */
module.exports = router;
