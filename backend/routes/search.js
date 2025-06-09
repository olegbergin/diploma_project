// routes/search.js
const express = require("express");
const router = express.Router();
// Get the database connection object once
const db = require("../dbSingleton").getConnection();

// Define a GET route for '/businesses'
router.get("/businesses", (req, res) => {
  console.log("GET /api/search/businesses - Received request.");
  console.log("Query parameters:", req.query);

  let sql = `
    SELECT 
      b.business_id, b.name, b.category, b.description, b.location, b.photos, b.schedule,
      COALESCE(AVG(r.rating), 0) as average_rating, 
      COUNT(r.review_id) as review_count
    FROM businesses b
    LEFT JOIN reviews r ON b.business_id = r.business_id
  `;

  const queryParams = [];
  const whereClauses = [];

  if (req.query.searchTerm && req.query.searchTerm.trim() !== "") {
    whereClauses.push(`(b.name LIKE ? OR b.description LIKE ?)`);
    queryParams.push(
      `%${req.query.searchTerm.trim()}%`,
      `%${req.query.searchTerm.trim()}%`
    );
  }
  if (req.query.category && req.query.category.trim() !== "") {
    whereClauses.push(`b.category = ?`);
    queryParams.push(req.query.category.trim());
  }

  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  sql += ` GROUP BY b.business_id`;

  if (req.query.min_rating && parseFloat(req.query.min_rating) > 0) {
    sql += ` HAVING COALESCE(AVG(r.rating), 0) >= ?`;
    queryParams.push(parseFloat(req.query.min_rating));
  }

  sql += ` ORDER BY b.name ASC`;

  const limit = parseInt(req.query.limit) || 10;
  const offset = parseInt(req.query.offset) || 0;
  sql += ` LIMIT ? OFFSET ?`;
  queryParams.push(limit, offset);

  console.log("Executing SQL:", sql);
  console.log("With parameters:", queryParams);

  // Execute the main query
  db.query(sql, queryParams, (err, results) => {
    if (err) {
      console.error("Error executing main SQL query:", err);
      return res.status(500).json({ error: "Database query failed." });
    }

    console.log(
      "Successfully fetched businesses from DB. Count:",
      results.length
    );

    // Now, execute the count query inside the callback of the first query
    let countSql = `SELECT COUNT(DISTINCT b.business_id) as total
                    FROM businesses b
                    LEFT JOIN reviews r ON b.business_id = r.business_id`;
    const countSqlParams = [];
    const countWhereClauses = [];

    if (req.query.searchTerm && req.query.searchTerm.trim() !== "") {
      countWhereClauses.push(`(b.name LIKE ? OR b.description LIKE ?)`);
      countSqlParams.push(
        `%${req.query.searchTerm.trim()}%`,
        `%${req.query.searchTerm.trim()}%`
      );
    }
    if (req.query.category && req.query.category.trim() !== "") {
      countWhereClauses.push(`b.category = ?`);
      countSqlParams.push(req.query.category.trim());
    }
    if (countWhereClauses.length > 0) {
      countSql += ` WHERE ${countWhereClauses.join(" AND ")}`;
    }

    db.query(countSql, countSqlParams, (countErr, countResults) => {
      if (countErr) {
        console.error("Error executing count SQL query:", countErr);
        // If count fails, still send the main results with a fallback total
        return res.json({ results: results, total: results.length });
      }

      const totalItems = countResults[0] ? countResults[0].total : 0;
      console.log("Total items matching filter (for pagination):", totalItems);

      res.json({
        results: results,
        total: totalItems,
      });
    });
  });
});

module.exports = router;
