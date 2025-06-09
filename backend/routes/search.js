// routes/search.js

const express = require("express");
const router = express.Router();
const { getConnection } = require("../dbSingleton");

// Define a GET route for '/businesses'
router.get("/businesses", async (req, res) => {
  try {
    console.log("GET /api/search/businesses - Received request.");
    console.log("Query parameters:", req.query);

    // Get database connection
    const db = getConnection();

    // --- Start building the SQL query ---
    // Base SQL query to select necessary fields and calculate average rating
    let sql = `
      SELECT 
        b.business_id, 
        b.name, 
        b.category, 
        b.description, 
        b.location, 
        b.photos, 
        b.schedule,
        COALESCE(AVG(r.rating), 0) as average_rating, 
        COUNT(r.review_id) as review_count
      FROM businesses b
      LEFT JOIN reviews r ON b.business_id = r.business_id
    `;

    // Array to hold parameters for the SQL query (to prevent SQL injection)
    const queryParams = [];
    // Array to hold WHERE clauses for filtering
    const whereClauses = [];

    // --- Handle Filters from req.query ---

    // 1. Filter by searchTerm (search in business name or description)
    if (req.query.searchTerm && req.query.searchTerm.trim() !== "") {
      whereClauses.push(`(b.name LIKE ? OR b.description LIKE ?)`);
      const searchTermParam = `%${req.query.searchTerm.trim()}%`;
      queryParams.push(searchTermParam, searchTermParam);
    }

    // 2. Filter by category
    if (req.query.category && req.query.category.trim() !== "") {
      whereClauses.push(`b.category = ?`);
      queryParams.push(req.query.category.trim());
    }

    // --- Append WHERE clauses to SQL query if any filters are applied ---
    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(" AND ")}`;
    }

    // --- Group by business_id to make AVG() and COUNT() work correctly for each business ---
    sql += ` GROUP BY b.business_id`;

    // 3. Filter by minimum rating (applied after grouping using HAVING)
    if (req.query.min_rating && parseFloat(req.query.min_rating) > 0) {
      sql += ` HAVING COALESCE(AVG(r.rating), 0) >= ?`;
      queryParams.push(parseFloat(req.query.min_rating));
    }

    // --- Add Ordering (Example: order by name, can be made configurable later) ---
    sql += ` ORDER BY b.name ASC`;

    // --- Add Pagination (Limit and Offset) ---
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    sql += ` LIMIT ? OFFSET ?`;
    queryParams.push(limit, offset);

    console.log("Executing SQL:", sql);
    console.log("With parameters:", queryParams);

    // Execute main query
    const [results] = await db.query(sql, queryParams);

    // Get total count for pagination
    let countSql = `
      SELECT COUNT(DISTINCT b.business_id) as total
      FROM businesses b
      LEFT JOIN reviews r ON b.business_id = r.business_id
    `;

    const countWhereClauses = [...whereClauses];
    const countQueryParams = [...queryParams.slice(0, -2)]; // Remove limit and offset params

    if (countWhereClauses.length > 0) {
      countSql += ` WHERE ${countWhereClauses.join(" AND ")}`;
    }

    const [countResult] = await db.query(countSql, countQueryParams);
    const total = countResult[0].total;

    // Send response
    res.json({
      results,
      total,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Error executing search query:", err);
    res
      .status(500)
      .json({ error: "Failed to fetch businesses. Please try again." });
  }
});

module.exports = router;
