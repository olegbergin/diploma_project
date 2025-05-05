const db = require("../db");

const registerUser = (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  if (!email || !password || !firstName || !lastName || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const connection = db.getConnection();
  const sql =
    "INSERT INTO users (first_name, last_name, email, phone, password) VALUES (?, ?, ?, ?, ?)";

  connection.query(
    sql,
    [firstName, lastName, email, phone, password],
    (err, result) => {
      if (err) {
        console.error(" Error inserting user:", err);
        return res.status(500).json({ error: "Database error" });
      }
      res
        .status(201)
        .json({
          message: "User registered successfully",
          userId: result.insertId,
        });
    }
  );
};

const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const connection = db.getConnection();
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";

  connection.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error(" Login error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = results[0];
    res.status(200).json({ message: "Login successful", user });
  });
};

module.exports = {
  registerUser,
  loginUser,
};
