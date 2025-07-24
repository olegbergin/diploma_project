// routes/search.js (new, simplified version)
const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise(); // Use our new method!

router.get("/businesses", async (req, res) => {
  try {
    // Validation
    const errors = {};
    
    if (req.query.limit && (isNaN(parseInt(req.query.limit)) || parseInt(req.query.limit) < 1 || parseInt(req.query.limit) > 100)) {
      errors.limit = "Limit must be a number between 1-100 / Limit חייב להיות מספר בין 1-100";
    }
    
    if (req.query.offset && (isNaN(parseInt(req.query.offset)) || parseInt(req.query.offset) < 0)) {
      errors.offset = "Offset must be a non-negative number / Offset חייב להיות מספר חיובי או אפס";
    }
    
    if (req.query.min_rating && (isNaN(parseFloat(req.query.min_rating)) || parseFloat(req.query.min_rating) < 0 || parseFloat(req.query.min_rating) > 5)) {
      errors.min_rating = "Minimum rating must be between 0-5 / דירוג מינימלי חייב להיות בין 0-5";
    }
    
    if (req.query.searchTerm && typeof req.query.searchTerm !== 'string') {
      errors.searchTerm = "Search term must be a string / מונח חיפוש חייב להיות טקסט";
    }
    
    if (req.query.category && typeof req.query.category !== 'string') {
      errors.category = "Category must be a string / קטגוריה חייבת להיות טקסט";
    }
    
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // --- Step 1: Build the WHERE clauses and parameters just ONCE ---
    const whereClauses = [];
    const params = [];

    if (req.query.searchTerm && req.query.searchTerm.trim()) {
      const trimmedTerm = req.query.searchTerm.trim();
      if (trimmedTerm.length > 100) {
        return res.status(400).json({ 
          errors: { searchTerm: "Search term too long (max 100 characters) / מונח חיפוש ארוך מדי (מקסימום 100 תווים)" }
        });
      }
      whereClauses.push(`(b.name LIKE ? OR b.description LIKE ?)`);
      const searchTerm = `%${trimmedTerm}%`;
      params.push(searchTerm, searchTerm);
    }
    
    if (req.query.category && req.query.category.trim()) {
      const trimmedCategory = req.query.category.trim();
      if (trimmedCategory.length > 50) {
        return res.status(400).json({ 
          errors: { category: "Category name too long (max 50 characters) / שם קטגוריה ארוך מדי (מקסימום 50 תווים)" }
        });
      }
      whereClauses.push(`b.category = ?`);
      params.push(trimmedCategory);
    }

    // Combine clauses into a string, e.g., "WHERE (b.name LIKE ...) AND b.category = ?"
    const whereSql =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    // --- Step 2: Build the query for counting total items ---
    let countSql = `SELECT COUNT(DISTINCT b.business_id) as total FROM businesses b ${whereSql}`;

    // --- Step 3: Build the main query for getting the page results ---
    let resultsSql = `
      SELECT 
        b.business_id, b.name, b.category, b.description, b.location, b.photos,
        COALESCE(AVG(r.rating), 0) as average_rating, 
        COUNT(r.review_id) as review_count
      FROM businesses b
      LEFT JOIN reviews r ON b.business_id = r.business_id
      ${whereSql}
      GROUP BY b.business_id
    `;

    const resultsParams = [...params]; // Copy params for the results query

    if (req.query.min_rating && parseFloat(req.query.min_rating) > 0) {
      resultsSql += ` HAVING average_rating >= ?`; // Use the alias here
      resultsParams.push(parseFloat(req.query.min_rating));
    }

    resultsSql += ` ORDER BY b.name ASC`;

    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Cap at 100
    const offset = Math.max(parseInt(req.query.offset) || 0, 0); // Ensure non-negative
    resultsSql += ` LIMIT ? OFFSET ?`;
    resultsParams.push(limit, offset);

    // --- Step 4: Execute both queries at the same time ---
    // Promise.all runs both queries in parallel, which is more efficient.
    const [
      [countResult], // The result from the first query (count)
      [results], // The result from the second query (data)
    ] = await Promise.all([
      db.query(countSql, params),
      db.query(resultsSql, resultsParams),
    ]);

    // Validate results
    if (!countResult || countResult.length === 0) {
      return res.status(500).json({ error: "Failed to get count results / שליפת מספר התוצאות נכשלה" });
    }

    // --- Step 5: Send the combined response ---
    res.json({
      results: results || [],
      total: countResult[0].total || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (countResult[0].total || 0)
    });
  } catch (error) {
    console.error("Error in /search/businesses:", error);
    res.status(500).json({ error: "Search failed / חיפוש נכשל" });
  }
});

module.exports = router;
