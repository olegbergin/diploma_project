// backend/dbSingleton.js
const mysql = require("mysql2/promise"); // ← promise!

let pool; // Pool אחד לכל האפליקציה

async function getConnection() {
  if (!pool) {
    pool = await mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "project_db",
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
    console.log("✅ Connected to MySQL (Promise pool)!");
  }
  return pool; // pool.query(...) מחזיר Promise
}

module.exports = { getConnection };
