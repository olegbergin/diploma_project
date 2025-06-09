const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { getConnection } = require("../dbSingleton");

const JWT_SECRET = "secret_key";

router.post("/register", async (req, res) => {
  try {
    const { first_name, last_name, email, phone, password, role } = req.body;
    const db = await getConnection();

    // Check if user already exists
    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
                 VALUES (?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(sql, [
      first_name,
      last_name,
      email,
      phone,
      hashedPassword,
      role,
    ]);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getConnection();

    const sql = `SELECT * FROM users WHERE email = ?`;
    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.user_id, role: user.role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({
      token,
      user: {
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

module.exports = router;
