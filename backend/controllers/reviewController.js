const db = require("../db");

const createReview = (req, res) => {
  const { userId, businessId, rating, comment, date } = req.body;
  const sql =
    "INSERT INTO reviews (user_id, business_id, rating, comment, date) VALUES (?, ?, ?, ?, ?)";
  db.getConnection().query(
    sql,
    [userId, businessId, rating, comment, date],
    (err, result) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.status(201).json({ reviewId: result.insertId });
    }
  );
};

const getReviewsForBusiness = (req, res) => {
  const sql = "SELECT * FROM reviews WHERE business_id = ?";
  db.getConnection().query(sql, [req.params.businessId], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.status(200).json(results);
  });
};

module.exports = { createReview, getReviewsForBusiness };
