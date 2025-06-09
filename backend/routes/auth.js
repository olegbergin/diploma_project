// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// Get the database connection object from the singleton
const dbConnection = require("../dbSingleton").getConnection(); // This line is correct

// It's better to store JWT_SECRET in an environment variable
const JWT_SECRET = process.env.JWT_SECRET || "my_name_is_oleg"; // CHANGE THIS!

// --- User Registration ---
router.post("/register", (req, res) => {
  // Destructure request body
  const {
    first_name,
    last_name,
    email,
    phone,
    password,
    role = "customer",
  } = req.body; // Default role to 'customer'

  // Validate required fields (basic validation)
  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      error: "Missing required fields: first_name, last_name, email, password.",
    });
  }

  // Hash the password
  // bcrypt.hash is asynchronous, so we use its callback.
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ error: "Error hashing password." });
    }

    // SQL query to insert the new user
    const sql = `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
                 VALUES (?, ?, ?, ?, ?, ?)`;
    const params = [first_name, last_name, email, phone, hashedPassword, role];

    if (!dbConnection) {
      console.error("Database connection not available for registration.");
      return res.status(500).json({ error: "Database connection error." });
    }

    // Execute the query using the db connection
    dbConnection.query(sql, params, (dbErr, result) => {
      if (dbErr) {
        console.error("Database error during registration:", dbErr);
        // Handle specific errors like duplicate email
        if (dbErr.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Email already exists." }); // 409 Conflict
        }
        return res.status(500).json({ error: "Failed to register user." });
      }

      // Successfully registered
      console.log("User registered successfully. Insert ID:", result.insertId);
      res.status(201).json({
        message: "User registered successfully",
        userId: result.insertId, // It's good to return the ID of the created resource
      });
    });
  });
});

// --- User Login ---
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  // SQL query to find the user by email
  // Select only necessary fields
  const sql = `SELECT user_id, first_name, last_name, email, password_hash, role FROM users WHERE email = ?`;

  if (!dbConnection) {
    console.error("Database connection not available for login.");
    return res.status(500).json({ error: "Database connection error." });
  }

  dbConnection.query(sql, [email], (dbErr, results) => {
    if (dbErr) {
      console.error("Database error during login (fetch user):", dbErr);
      return res.status(500).json({ error: "Error during login process." });
    }

    // Check if user was found
    if (results.length === 0) {
      console.log(`Login attempt failed: No user found for email ${email}`);
      return res.status(401).json({ error: "Invalid credentials." }); // User not found
    }

    const user = results[0]; // Get the first (and should be only) user

    // Compare the provided password with the hashed password from the database
    // bcrypt.compare is asynchronous
    bcrypt.compare(password, user.password_hash, (compareErr, isMatch) => {
      if (compareErr) {
        console.error("Error comparing passwords:", compareErr);
        return res.status(500).json({ error: "Error during authentication." });
      }

      if (!isMatch) {
        console.log(
          `Login attempt failed: Incorrect password for email ${email}`
        );
        return res.status(401).json({ error: "Invalid credentials." }); // Password doesn't match
      }

      // --- Password matches: User is authenticated ---
      console.log(`User ${user.email} logged in successfully.`);

      // Create a JWT payload
      const payload = {
        userId: user.user_id, // Use userId consistently
        role: user.role,
        // You can add other non-sensitive info if needed, but keep payload small
        // name: user.first_name
      };

      // Sign the JWT
      const token = jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: "1h" } // Token expiration time (e.g., 1 hour)
        // Consider '24h' or '7d' for longer sessions if appropriate
      );

      // Send the token AND user information back to the client
      res.json({
        message: "Login successful",
        token: token,
        user: {
          // This is what the frontend expects for UserContext
          user_id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name, // Send last_name too
          email: user.email,
          role: user.role,
        },
      });
    });
  });
});

module.exports = router;
