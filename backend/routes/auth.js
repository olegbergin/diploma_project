const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../dbSingleton').getConnection();

const JWT_SECRET = 'secret_key';

router.post('/register', async (req, res) => {
  const { first_name, last_name, email, phone, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
               VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(sql, [first_name, last_name, email, phone, hashedPassword, role], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'User registered successfully' });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = ?`;
  db.query(sql, [email], async (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = results[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: 'Wrong password' });

    const token = jwt.sign({ id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

module.exports = router;
