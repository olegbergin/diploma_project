// backend/dbSingleton.js
const mysql = require("mysql2/promise");

let pool = null;

async function initPool() {
  if (!pool) {
    try {
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
    } catch (err) {
      console.error("Failed to create connection pool:", err);
      throw err;
    }
  }
  return pool;
}

// Initialize the pool when this module is loaded
initPool().catch((err) => {
  console.error("Failed to initialize database pool:", err);
  process.exit(1);
});

// Export a function that returns the pool
module.exports = {
  getConnection: () => {
    if (!pool) {
      throw new Error("Database connection not initialized");
    }
    return pool;
  },
};
