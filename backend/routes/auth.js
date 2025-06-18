// backend/routes/auth.js
// ------------------------------------------------------------
// User Authentication Routes (Login & Register)
// ------------------------------------------------------------
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// קישור לממשק ההבטחות של בסיס הנתונים (Promise-based DB singleton)
const db = require("../dbSingleton").getPromise();

const JWT_SECRET = process.env.JWT_SECRET || "my_name_is_oleg";

// ============================================================
// User Registration (רישום משתמש חדש)
// ============================================================
router.post("/register", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    password,
    role = "customer",
  } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields." }); // חסרים שדות חובה
  }

  try {
    // 1. Hash the password (הצפנת סיסמה)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Insert new user to the database (הוספת משתמש חדש)
    const sql = `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [first_name, last_name, email, phone, hashedPassword, role];

    const [result] = await db.query(sql, params);

    // 3. Return success (החזרת מזהה משתמש)
    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (err) {
    console.error("Error during registration:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists." }); // אימייל קיים כבר
    }
    res.status(500).json({ error: "Failed to register user." });
  }
});

// ============================================================
// User Login (התחברות משתמש)
// ============================================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." }); // יש להזין אימייל וסיסמה
  }

  try {
    // 1. Find the user by email (שליפת משתמש לפי אימייל)
    const sql = `
      SELECT user_id, first_name, last_name, email, password_hash, role
      FROM users WHERE email = ?
    `;
    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." }); // אימייל לא קיים
    }
    const user = results[0];

    // 2. Compare password hash (בדיקת סיסמה)
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." }); // סיסמה לא נכונה
    }

    // 3. If the user is business, fetch their business_id (אם המשתמש בעל עסק, נשלוף את מזהה העסק)
    let businessId = null;
    if (user.role === "business") {
      const [businessRows] = await db.query(
        "SELECT business_id FROM businesses WHERE owner_id = ? LIMIT 1",
        [user.user_id]
      );
      if (businessRows.length) {
        businessId = businessRows[0].business_id;
      }
    }

    // 4. Create the JWT payload and token (יצירת טוקן התחברות)
    const payload = { userId: user.user_id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // 5. Return user data with businessId if relevant (החזרת נתוני משתמש כולל מזהה עסק אם יש)
    res.json({
      message: "Login successful",
      token: token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        businessId: businessId, // מזהה עסק (רק לבעלים)
      },
    });
  } catch (err) {
    console.error("Error during login process:", err);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

module.exports = router;
