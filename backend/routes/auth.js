// backend/routes/auth.js (new, simplified version)
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Get the database promise interface from the singleton
const db = require("../dbSingleton").getPromise(); // Use our new method!

const JWT_SECRET = process.env.JWT_SECRET || "my_name_is_oleg";

// --- User Registration (Refactored with async/await) ---
router.post("/register", async (req, res) => {
  // <-- Add async
  const {
    first_name,
    last_name,
    email,
    phone,
    password,
    role = "customer",
  } = req.body;
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    // 1. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Insert the new user into the database
    const sql = `INSERT INTO users (first_name, last_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [first_name, last_name, email, phone, hashedPassword, role];

    const [result] = await db.query(sql, params); // <-- Use await

    // 3. Send a success response
    res.status(201).json({
      message: "User registered successfully",
      userId: result.insertId,
    });
  } catch (err) {
    console.error("Error during registration:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists." });
    }
    res.status(500).json({ error: "Failed to register user." });
  }
});

// --- User Login (Refactored with async/await) ---
router.post("/login", async (req, res) => {
  // <-- Add async
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // 1. Find the user by email
    const sql = `SELECT user_id, first_name, last_name, email, password_hash, role FROM users WHERE email = ?`;
    const [results] = await db.query(sql, [email]); // <-- Use await

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }
    const user = results[0];

    // 2. Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password_hash); // <-- Use await
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 3. Create the JWT payload and token
    const payload = { userId: user.user_id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });

    // 4. Send the successful response
    res.json({
      message: "Login successful",
      token: token,
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Error during login process:", err);
    res.status(500).json({ error: "An internal server error occurred." });
  }
});

module.exports = router;
