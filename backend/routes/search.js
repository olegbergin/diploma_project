// routes/search.js

const express = require("express");
const router = express.Router();
const db = require("../dbSingleton_old").getConnection(); // Import your database connection module

// Define a GET route for '/businesses'
router.get("/businesses", (req, res) => {
  console.log("GET /api/search/businesses - Received request.");
  console.log("Query parameters:", req.query);

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
    // Add a WHERE clause for searching. The 'LIKE' operator with '%' allows partial matches.
    whereClauses.push(`(b.name LIKE ? OR b.description LIKE ?)`);
    // Add the searchTerm to our queryParams array, once for name and once for description
    queryParams.push(`%${req.query.searchTerm.trim()}%`);
    queryParams.push(`%${req.query.searchTerm.trim()}%`);
  }

  // 2. Filter by category
  if (req.query.category && req.query.category.trim() !== "") {
    whereClauses.push(`b.category = ?`);
    queryParams.push(req.query.category.trim());
  }

  // --- Append WHERE clauses to SQL query if any filters are applied ---
  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(" AND ")}`;
    // Example: sql += " WHERE (b.name LIKE ? OR b.description LIKE ?) AND b.category = ?"
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
  // Set default limit and offset if not provided in query
  const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
  const offset = parseInt(req.query.offset) || 0; // Default to starting from the first item

  sql += ` LIMIT ? OFFSET ?`;
  queryParams.push(limit);
  queryParams.push(offset);

  console.log("Executing SQL:", sql);
  console.log("With parameters:", queryParams);

  // --- Execute the query using the db module ---
  db.query(sql, queryParams, (err, results) => {
    if (err) {
      // If there's an error with the database query
      console.error("Error executing SQL query:", err);
      // Send a 500 Internal Server Error response
      // It's good practice not to send detailed SQL errors to the client in production
      return res.status(500).json({ error: "Database query failed." });
    }

    // If the query is successful
    console.log(
      "Successfully fetched businesses from DB. Count:",
      results.length
    );

    // We also need the total count of businesses for pagination (without limit/offset)
    // This is a simplified approach. For performance with large datasets,
    // a separate COUNT(*) query with the same WHERE/HAVING clauses would be better.
    // For now, let's assume the 'total' would be part of a more complex response or a separate endpoint.
    // We'll just send the results for now.
    // To properly implement pagination, the frontend needs to know the total number of items.
    // We can construct a response object that includes both the results and the total count.

    // Let's make a second query to get the total count for pagination
    // This is not the most efficient way for very large tables but is simpler to understand for now.
    let countSql = `SELECT COUNT(DISTINCT b.business_id) as total
                    FROM businesses b
                    LEFT JOIN reviews r ON b.business_id = r.business_id`;
    const countSqlParams = []; // Parameters for the count query
    const countWhereClauses = []; // WHERE clauses for the count query

    // Re-apply filters for the count query (without pagination or ordering)
    if (req.query.searchTerm && req.query.searchTerm.trim() !== "") {
      countWhereClauses.push(`(b.name LIKE ? OR b.description LIKE ?)`);
      countSqlParams.push(`%${req.query.searchTerm.trim()}%`);
      countSqlParams.push(`%${req.query.searchTerm.trim()}%`);
    }
    if (req.query.category && req.query.category.trim() !== "") {
      countWhereClauses.push(`b.category = ?`);
      countSqlParams.push(req.query.category.trim());
    }
    if (countWhereClauses.length > 0) {
      countSql += ` WHERE ${countWhereClauses.join(" AND ")}`;
    }
    // Note: For min_rating with COUNT, you might need a subquery if it's complex,
    // or accept a slightly different total if min_rating significantly reduces the count.
    // For simplicity here, we omit the HAVING clause from the count,
    // or you could construct it carefully.

    db.query(countSql, countSqlParams, (countErr, countResults) => {
      if (countErr) {
        console.error("Error executing count SQL query:", countErr);
        // Still send the main results if count fails, but log the error
        return res.json({ results: results, total: results.length }); // Fallback total
      }

      const totalItems = countResults[0] ? countResults[0].total : 0;
      console.log("Total items matching filter (for pagination):", totalItems);

      // Send the results (array of businesses) and total count as a JSON response
      res.json({
        results: results,
        total: totalItems,
      });
    });
  });
});

module.exports = router;
