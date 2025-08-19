// routes/search.js (updated: geo radius filtering + distance ordering)
const express = require("express");
const router = express.Router();
const db = require("../dbSingleton").getPromise(); // Promise-based connection

/**
 * Haversine expression (in KM) for MySQL:
 * 2 * R * ASIN( sqrt( sin^2((lat1-lat2)/2) + cos(lat1)*cos(lat2)*sin^2((lng1-lng2)/2) ) )
 * We pass placeholders for lat, lat, lng in this order.
 */
function getDistanceExpr() {
  return `(
    6371 * 2 * ASIN(
      SQRT(
        POWER(SIN(RADIANS(? - b.latitude) / 2), 2) +
        COS(RADIANS(?)) * COS(RADIANS(b.latitude)) *
        POWER(SIN(RADIANS(? - b.longitude) / 2), 2)
      )
    )
  )`;
}

router.get("/businesses", async (req, res) => {
  try {
    // ─────────────────────────────────────────
    // 1) Validation
    // ─────────────────────────────────────────
    const errors = {};

    // pagination
    const rawLimit = req.query.limit;
    const rawOffset = req.query.offset;

    if (
      rawLimit &&
      (isNaN(parseInt(rawLimit)) ||
        parseInt(rawLimit) < 1 ||
        parseInt(rawLimit) > 100)
    ) {
      errors.limit =
        "Limit must be a number between 1-100 / Limit חייב להיות מספר בין 1-100";
    }
    if (rawOffset && (isNaN(parseInt(rawOffset)) || parseInt(rawOffset) < 0)) {
      errors.offset =
        "Offset must be a non-negative number / Offset חייב להיות מספר חיובי או אפס";
    }

    // ratings
    const rawMinRating = req.query.min_rating;
    if (
      rawMinRating &&
      (isNaN(parseFloat(rawMinRating)) ||
        parseFloat(rawMinRating) < 0 ||
        parseFloat(rawMinRating) > 5)
    ) {
      errors.min_rating =
        "Minimum rating must be between 0-5 / דירוג מינימלי חייב להיות בין 0-5";
    }

    // free-text filters
    const rawSearchTerm = req.query.searchTerm;
    if (rawSearchTerm && typeof rawSearchTerm !== "string") {
      errors.searchTerm =
        "Search term must be a string / מונח חיפוש חייב להיות טקסט";
    }
    const rawCategory = req.query.category;
    if (rawCategory && typeof rawCategory !== "string") {
      errors.category = "Category must be a string / קטגוריה חייב להיות טקסט";
    }

    // geo filters
    const rawLat = req.query.lat;
    const rawLng = req.query.lng;
    const rawRadiusKm = req.query.radiusKm;
    const rawOrderBy = req.query.orderBy;

    let lat = rawLat !== undefined ? parseFloat(rawLat) : null;
    let lng = rawLng !== undefined ? parseFloat(rawLng) : null;
    let radiusKm = rawRadiusKm !== undefined ? parseFloat(rawRadiusKm) : null;
    let orderBy = (rawOrderBy || "name").toLowerCase();

    const usingGeo = lat !== null && !isNaN(lat) && lng !== null && !isNaN(lng);
    const usingRadius = usingGeo && radiusKm !== null && !isNaN(radiusKm);

    if (
      (rawLat !== undefined ||
        rawLng !== undefined ||
        rawRadiusKm !== undefined) &&
      !usingGeo
    ) {
      errors.geo =
        "Both lat and lng must be valid numbers / חייבים לספק lat ו-lng תקינים";
    }
    if (usingRadius && (radiusKm <= 0 || radiusKm > 200)) {
      errors.radiusKm =
        "radiusKm must be between 1-200 km / radiusKm חייב להיות בין 1-200 ק״מ";
    }

    // orderBy
    const allowedOrder = new Set(["name", "category", "newest", "distance"]);
    if (!allowedOrder.has(orderBy)) {
      orderBy = "name";
    }
    if (orderBy === "distance" && !usingGeo) {
      errors.orderBy =
        "Ordering by distance requires valid lat & lng / מיון לפי מרחק דורש lat/lng תקינים";
    }

    // length guards
    if (rawSearchTerm && rawSearchTerm.trim().length > 100) {
      errors.searchTerm =
        "Search term too long (max 100 chars) / מונח חיפוש ארוך מדי (מקסימום 100 תווים)";
    }
    if (rawCategory && rawCategory.trim().length > 50) {
      errors.category =
        "Category name too long (max 50 chars) / שם קטגוריה ארוך מדי (מקסימום 50 תווים)";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    const limit = Math.min(parseInt(rawLimit || "10"), 100);
    const offset = Math.max(parseInt(rawOffset || "0"), 0);
    const minRating =
      rawMinRating !== undefined ? parseFloat(rawMinRating) : null;

    // ─────────────────────────────────────────
    // 2) Build WHERE once
    // ─────────────────────────────────────────
    const whereClauses = [];
    const whereParams = [];

    if (rawSearchTerm && rawSearchTerm.trim()) {
      const term = `%${rawSearchTerm.trim()}%`;
      // שמרתי את אותו אופי פילטר כמו בקובץ המקורי שלך
      whereClauses.push(
        `(b.name LIKE ? OR b.description LIKE ? OR b.category LIKE ?)`
      );
      whereParams.push(term, term, term);
    }

    if (rawCategory && rawCategory.trim()) {
      whereClauses.push(`b.category = ?`);
      whereParams.push(rawCategory.trim());
    }

    if (usingGeo) {
      // אם מסננים/מסדרים לפי מרחק - צריך רק עסקים שיש להם lat/lng
      whereClauses.push(`b.latitude IS NOT NULL AND b.longitude IS NOT NULL`);
    }

    const whereSql = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    // ─────────────────────────────────────────
    // 3) COUNT query (with geo radius if applicable)
    // ─────────────────────────────────────────
    let countSql, countParams;
    if (usingGeo) {
      const distanceExpr = getDistanceExpr();
      countSql = `
        SELECT COUNT(*) AS total
        FROM (
          SELECT b.business_id,
                 ${distanceExpr} AS distance_km
          FROM businesses b
          ${whereSql}
          GROUP BY b.business_id
        ) AS t
        ${usingRadius ? `WHERE t.distance_km <= ?` : ``}
      `;
      // סדר פרמטרים: [lat, lat, lng] + whereParams + (radiusKm?)
      countParams = [lat, lat, lng, ...whereParams];
      if (usingRadius) countParams.push(radiusKm);
    } else {
      countSql = `SELECT COUNT(DISTINCT b.business_id) AS total FROM businesses b ${whereSql}`;
      countParams = [...whereParams];
    }

    // ─────────────────────────────────────────
    // 4) RESULTS query (data page)
    // ─────────────────────────────────────────
    const distanceExpr = usingGeo ? getDistanceExpr() : null;

    let resultsSql = `
      SELECT
        b.business_id,
        b.name,
        b.category,
        b.description,
        b.location,
        b.photos,
        b.latitude,
        b.longitude,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.review_id) AS review_count
        ${usingGeo ? `, ${distanceExpr} AS distance_km` : ``}
      FROM businesses b
      LEFT JOIN reviews r ON b.business_id = r.business_id
      ${whereSql}
      GROUP BY b.business_id
    `;

    let resultsParams = [];
    if (usingGeo) {
      // סדר פרמטרים: [lat, lat, lng] + whereParams
      resultsParams.push(lat, lat, lng);
    }
    resultsParams.push(...whereParams);

    // HAVING
    const havingClauses = [];
    const havingParams = [];

    if (minRating !== null && !isNaN(minRating) && minRating > 0) {
      havingClauses.push(`average_rating >= ?`);
      havingParams.push(minRating);
    }
    if (usingRadius) {
      havingClauses.push(`distance_km <= ?`);
      havingParams.push(radiusKm);
    }

    if (havingClauses.length) {
      resultsSql += ` HAVING ${havingClauses.join(" AND ")}`;
    }

    // ORDER BY
    switch (orderBy) {
      case "category":
        resultsSql += ` ORDER BY b.category ASC, b.name ASC`;
        break;
      case "newest":
        // בהשראת הקליינט שלך: newest לפי business_id יורד
        resultsSql += ` ORDER BY b.business_id DESC`;
        break;
      case "distance":
        resultsSql += ` ORDER BY distance_km ASC, b.name ASC`;
        break;
      case "name":
      default:
        resultsSql += ` ORDER BY b.name ASC`;
        break;
    }

    // LIMIT/OFFSET
    resultsSql += ` LIMIT ? OFFSET ?`;
    resultsParams.push(limit, offset, ...havingParams); // רגע! צריך שה-HAVING יגיע לפני LIMIT. נסדר:

    // חשוב: סדר הפרמטרים צריך להתאים למיקומים ב-SQL:
    // עד כאן resultsParams = [lat,lat,lng?, ...whereParams]
    // ואז נוסיף HAVING אחרי שבנינו את המשפט; בפועל HAVING בא אחרי GROUP BY ולפני ORDER, אבל מאחר שאנחנו בונים מחרוזת כולה למעלה,
    // נדחוף את פרמטרי HAVING לפני limit/offset. נתקן את הסדר:

    // בנייה מחדש של המערך לפי הסדר הנכון:
    resultsParams = [];
    if (usingGeo) resultsParams.push(lat, lat, lng); // distance placeholders
    resultsParams.push(...whereParams); // where params
    resultsParams.push(...havingParams); // having params
    resultsParams.push(limit, offset); // pagination

    // ─────────────────────────────────────────
    // 5) Execute both queries in parallel
    // ─────────────────────────────────────────
    const [[countResult], [results]] = await Promise.all([
      db.query(countSql, countParams),
      db.query(resultsSql, resultsParams),
    ]);

    if (!countResult || countResult.length === 0) {
      return res
        .status(500)
        .json({
          error: "Failed to get count results / שליפת מספר התוצאות נכשלה",
        });
    }

    const total = countResult[0].total || 0;

    // ─────────────────────────────────────────
    // 6) Response
    // ─────────────────────────────────────────
    res.json({
      results: results || [],
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Error in /search/businesses:", error);
    res.status(500).json({ error: "Search failed / חיפוש נכשל" });
  }
});

module.exports = router;
