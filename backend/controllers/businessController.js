const db = require("../db");

const createBusiness = (req, res) => {
  const { userId, name, category, description } = req.body;
  const sql =
    "INSERT INTO businesses (user_id, name, category, description) VALUES (?, ?, ?, ?)";
  db.getConnection().query(
    sql,
    [userId, name, category, description],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ businessId: result.insertId });
    }
  );
};

const getAllBusinesses = (req, res) => {
  const sql = "SELECT * FROM businesses";
  db.getConnection().query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.status(200).json(results);
  });
};

const getBusinessById = (req, res) => {
  const sql = "SELECT * FROM businesses WHERE id = ?";
  db.getConnection().query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length === 0)
      return res.status(404).json({ error: "Business not found" });
    res.status(200).json(results[0]);
  });
};

module.exports = { createBusiness, getAllBusinesses, getBusinessById };
