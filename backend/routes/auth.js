/**
 * Authentication Routes Module
 * Handles user registration and login with JWT token generation
 * 
 * @module routes/auth
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../dbSingleton").getPromise();

/**
 * JWT Secret key for token signing
 * @type {string}
 */
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

  // Password validation (3-8 characters, alphanumeric with at least one letter and one number)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: "Password must be 3-8 characters long and contain at least one letter and one number." });
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
        userId: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
        businessId: businessId,
      },
    });
  } catch (err) {
    console.error("Error during login process:", err);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

// ============================================================
// Business Registration (רישום עסק חדש)
// ============================================================
router.post("/register-business", async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    password,
    businessName,
    category,
    description,
    businessPhone,
    businessEmail,
    city,
    address,
    location, // This will be concatenated city + address from frontend
    openingHours
  } = req.body;

  if (!first_name || !last_name || !email || !password || !businessName || !category || !description || !city) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Password validation (3-8 characters, alphanumeric with at least one letter and one number)
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ error: "Password must be 3-8 characters long and contain at least one letter and one number." });
  }

  try {
    // Start transaction
    await db.query('START TRANSACTION');

    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Insert business owner to users table
    const userSql = `
      INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?, 'business')
    `;
    const userParams = [first_name, last_name, email, phone, hashedPassword];
    const [userResult] = await db.query(userSql, userParams);
    const userId = userResult.insertId;

    // 3. Insert business to businesses table
    const businessSql = `
      INSERT INTO businesses (name, category, description, location, photos, schedule, owner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const businessParams = [
      businessName,
      category,
      description,
      address || '',
      '[]', // empty photos array
      openingHours ? `{"שעות פעילות": "${openingHours}"}` : '{}', // schedule as JSON
      userId
    ];
    const [businessResult] = await db.query(businessSql, businessParams);
    const businessId = businessResult.insertId;

    // Commit transaction
    await db.query('COMMIT');

    // 4. Return success
    res.status(201).json({
      message: "Business registered successfully",
      userId: userId,
      businessId: businessId,
    });
  } catch (err) {
    // Rollback transaction on error
    await db.query('ROLLBACK');
    
    console.error("Error during business registration:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: "Failed to register business." });
  }
});

module.exports = router;
