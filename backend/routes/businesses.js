const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise();

/* ───────────────────────────────
   1. Create a new business (POST /api/businesses)
   ─────────────────────────────── */
router.post("/", async (req, res) => {
  let {
    name,
    category,
    description,
    phone,
    email,
    address,
    image_url = "",
    schedule = "",
  } = req.body;

  // אם לא הוזן ערך לשעות פתיחה – נשלח null
  if (typeof schedule === "string" && schedule.trim() === "") {
    schedule = null;
  }

  const sql = `
    INSERT INTO businesses (name, category, description, phone, email, address, image_url, schedule)
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
    schedule,
  ];

  try {
    const [result] = await db.query(sql, params);
    res.status(201).json({ id: result.insertId, message: "Business created" });
  } catch (err) {
    console.error("DB error creating business:", err);
    res.status(500).json({ error: "Failed to create business." });
  }
});

/* ───────────────────────────────
   2. Get all businesses (GET /api/businesses)
   ─────────────────────────────── */
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM businesses");
    res.json(rows);
  } catch (err) {
    console.error("DB error fetching all businesses:", err);
    res.status(500).json({ error: "Failed to fetch businesses." });
  }
});

/* ───────────────────────────────
   3. Get a single business by ID (GET /api/businesses/:id)
   ─────────────────────────────── */
router.get("/:id", async (req, res) => {
  const sql = "SELECT * FROM businesses WHERE business_id = ?";
  const params = [req.params.id];

  try {
    const [rows] = await db.query(sql, params);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(`DB error fetching business with id ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to fetch business details." });
  }
});

/* ───────────────────────────────
   4. Update a business (PUT /api/businesses/:id)
   ─────────────────────────────── */
router.put("/:id", async (req, res) => {
  let {
    name,
    category,
    description,
    phone,
    email,
    address,
    image_url = "",
    schedule = "",
  } = req.body;

  // אם לא הוזן ערך לשעות פתיחה – נשלח null
  if (typeof schedule === "string" && schedule.trim() === "") {
    schedule = null;
  }

  // אפשרי להוסיף עוד בדיקות/התניות אם רוצים לא לאפשר ריקים או ערכי ברירת מחדל

  const sql = `
    UPDATE businesses SET name = ?, category = ?, description = ?, phone = ?, email = ?,
    address = ?, image_url = ?, schedule = ?
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
    schedule,
    req.params.id,
  ];

  try {
    const [result] = await db.query(sql, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Business not found" });
    }
    res.json({ message: "Business updated successfully" });
  } catch (err) {
    // שגיאות קונסטריינטים של מסד, כולל null לשדה חובה
    if (err.code === "ER_BAD_NULL_ERROR") {
      return res.status(400).json({ error: "יש למלא את כל השדות החובה." });
    }
    console.error(`DB error updating business with id ${req.params.id}:`, err);
    res.status(500).json({ error: "Failed to update business." });
  }
});

module.exports = router;
