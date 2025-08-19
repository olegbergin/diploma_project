// backend/routes/businesses.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const { geocodeAddress } = require("../utils/geocode");

// ───────────────────────────────
// GET כל העסקים
// ───────────────────────────────
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM businesses");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching businesses:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ───────────────────────────────
// GET עסק לפי ID
// ───────────────────────────────
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM businesses WHERE id = ?", [
      id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching business:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ───────────────────────────────
// POST צור עסק חדש
// ───────────────────────────────
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

  try {
    // Geocode הכתובת
    let latitude = null,
      longitude = null;
    if (address && address.trim()) {
      const { lat, lng } = await geocodeAddress(address);
      latitude = lat;
      longitude = lng;
    }

    const sql = `
      INSERT INTO businesses
        (name, category, description, phone, email, address, image_url, opening_hours, latitude, longitude)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(sql, [
      name,
      category,
      description,
      phone,
      email,
      address,
      image_url,
      opening_hours,
      latitude,
      longitude,
    ]);

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error("Error creating business:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ───────────────────────────────
// PUT עדכון עסק
// ───────────────────────────────
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    category,
    description,
    phone,
    email,
    address,
    image_url,
    opening_hours,
  } = req.body;

  try {
    // קודם נביא את הכתובת הישנה כדי לבדוק אם השתנתה
    const [oldRows] = await pool.query(
      "SELECT address FROM businesses WHERE id = ?",
      [id]
    );
    if (oldRows.length === 0) {
      return res.status(404).json({ error: "Business not found" });
    }

    let latitude = null,
      longitude = null;
    if (address && address.trim()) {
      // אם הכתובת השתנתה → נחשב מחדש lat/lng
      if (address !== oldRows[0].address) {
        const { lat, lng } = await geocodeAddress(address);
        latitude = lat;
        longitude = lng;
      } else {
        // משאירים lat/lng ישנים
        const [coords] = await pool.query(
          "SELECT latitude, longitude FROM businesses WHERE id = ?",
          [id]
        );
        latitude = coords[0].latitude;
        longitude = coords[0].longitude;
      }
    }

    const sql = `
      UPDATE businesses
      SET name = ?, category = ?, description = ?, phone = ?, email = ?, 
          address = ?, image_url = ?, opening_hours = ?, latitude = ?, longitude = ?
      WHERE id = ?
    `;
    await pool.query(sql, [
      name,
      category,
      description,
      phone,
      email,
      address,
      image_url,
      opening_hours,
      latitude,
      longitude,
      id,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating business:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ───────────────────────────────
// DELETE מחיקת עסק
// ───────────────────────────────
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM businesses WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting business:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
