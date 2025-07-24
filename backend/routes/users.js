// ------------------------------------------------------------
// User routes – פעולות פרופיל משתמש (קריאה, עדכון, סיסמה, מועדפים)
// ------------------------------------------------------------
const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise();
const bcrypt = require("bcryptjs");

// ------------------------------------------------------------
// שליפת פרטי משתמש (ללא סיסמה, כולל תמונה, כולל מיפוי avatarUrl)
// GET /api/users/:id
router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const sql =
      "SELECT user_id, first_name, last_name, email, phone, role, avatar_url FROM users WHERE user_id = ?";
    const [rows] = await db.query(sql, [userId]);
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    // חשוב למפות avatar_url => avatarUrl, כל השאר נשאר
    const user = rows[0];
    res.json({
      ...user,
      avatarUrl: user.avatar_url || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user details." });
  }
});

// ------------------------------------------------------------
// עדכון פרטי משתמש (כולל תמונה)
// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, phone, avatarUrl } = req.body;
  
  // Validation
  const errors = {};
  
  if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
    errors.firstName = "שם פרטי נדרש ויש להכיל לפחות 2 תווים / First name required, minimum 2 characters";
  }
  
  if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
    errors.lastName = "שם משפחה נדרש ויש להכיל לפחות 2 תווים / Last name required, minimum 2 characters";
  }
  
  if (!phone || typeof phone !== 'string' || !/^[0-9+\-\s()]{10,}$/.test(phone.trim())) {
    errors.phone = "מספר טלפון לא תקין / Invalid phone number";
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  try {
    // Check if user exists
    const [existingUser] = await db.query("SELECT user_id FROM users WHERE user_id = ?", [userId]);
    if (existingUser.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    
    await db.query(
      "UPDATE users SET first_name=?, last_name=?, phone=?, avatar_url=? WHERE user_id=?",
      [firstName.trim(), lastName.trim(), phone.trim(), avatarUrl || null, userId]
    );
    res.json({ message: "User updated successfully" });
  } catch (err) {
    console.error('User update error:', err);
    res.status(500).json({ error: "Update failed" });
  }
});

// ------------------------------------------------------------
// שינוי סיסמה של משתמש
// POST /api/users/:id/change-password
router.post("/:id/change-password", async (req, res) => {
  const userId = req.params.id;
  const { currentPassword, newPassword } = req.body;
  
  // Validation
  const errors = {};
  
  if (!currentPassword || typeof currentPassword !== 'string') {
    errors.currentPassword = "יש למלא סיסמה נוכחית / Current password required";
  }
  
  if (!newPassword || typeof newPassword !== 'string') {
    errors.newPassword = "יש למלא סיסמה חדשה / New password required";
  } else {
    // Password validation using same rules as registration
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/;
    if (!passwordRegex.test(newPassword)) {
      errors.newPassword = "הסיסמה חייבת להכיל 3-8 תווים עם לפחות אות אחת וספרה אחת / Password must be 3-8 characters long and contain at least one letter and one number";
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }
  
  try {
    // בדיקת סיסמה קיימת
    const [rows] = await db.query(
      "SELECT password_hash FROM users WHERE user_id = ?",
      [userId]
    );
    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });
    
    const isMatch = await bcrypt.compare(
      currentPassword,
      rows[0].password_hash
    );
    if (!isMatch)
      return res.status(400).json({ 
        errors: { currentPassword: "סיסמה נוכחית לא נכונה / Current password is incorrect" }
      });

    // עדכון סיסמה
    const hash = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password_hash = ? WHERE user_id = ?", [
      hash,
      userId,
    ]);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: "Failed to update password" });
  }
});

// ------------------------------------------------------------
// שליפת רשימת עסקים שאהבתי (מועדפים)
// GET /api/users/:id/favorites
router.get("/:id/favorites", async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.query(
      `SELECT b.business_id, b.name AS name, b.photos AS image_url
        FROM user_favorites f
        JOIN businesses b ON f.business_id = b.business_id
        WHERE f.user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to get favorites" });
  }
});

// ------------------------------------------------------------
// הוספת עסק למועדפים
// POST /api/users/:id/favorites
router.post("/:id/favorites", async (req, res) => {
  const userId = req.params.id;
  const { businessId } = req.body;
  try {
    await db.query(
      "INSERT IGNORE INTO user_favorites (user_id, business_id) VALUES (?, ?)",
      [userId, businessId]
    );
    res.json({ message: "Added to favorites" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// ------------------------------------------------------------
// הסרת עסק מהמועדפים
// DELETE /api/users/:id/favorites/:businessId
router.delete("/:id/favorites/:businessId", async (req, res) => {
  const { id, businessId } = req.params;
  try {
    await db.query(
      "DELETE FROM user_favorites WHERE user_id = ? AND business_id = ?",
      [id, businessId]
    );
    res.json({ message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

module.exports = router;
