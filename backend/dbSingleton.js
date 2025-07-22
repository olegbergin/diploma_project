/**
 * Database Singleton Module
 * Provides a single MySQL connection with automatic reconnection handling
 * 
 * @module dbSingleton
 */

const mysql = require("mysql2");

/**
 * Global connection instance
 * @type {mysql.Connection|null}
 */
let connection = null;

/**
 * Database configuration object
 * @type {Object}
 */
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root", 
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "project_db",
  charset: "utf8mb4",
};

/**
 * Handles database connection creation and reconnection
 * Implements automatic retry logic for failed connections
 */
function handleConnect() {
  console.log("Attempting to connect to MySQL database...");
  
  // Create new connection instance
  connection = mysql.createConnection(dbConfig);

  // Attempt initial connection
  connection.connect((err) => {
    if (err) {
      console.error("Failed to connect to database:", err.message);
      console.log("Retrying connection in 2 seconds...");
      
      // Retry connection after 2 seconds
      setTimeout(handleConnect, 2000);
      return;
    }
    
    console.log(`Successfully connected to MySQL database (ID: ${connection.threadId})`);
  });

  // Handle connection errors after successful connection
  connection.on("error", (err) => {
    console.error("Database connection error:", err.message);
    
    // Handle connection loss
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
      console.log("Database connection lost. Attempting to reconnect...");
      handleConnect();
    } else {
      console.error("Fatal database error:", err);
      throw err;
    }
  });
}

// Initialize database connection on module load
handleConnect();

/**
 * Database Singleton Object
 * Provides access to the MySQL connection instance
 * 
 * @namespace dbSingleton
 */
const dbSingleton = {
  /**
   * Returns the current database connection
   * @returns {mysql.Connection|null} The active MySQL connection
   */
  getConnection: () => {
    if (!connection) {
      console.warn("Database connection not available");
    }
    return connection;
  },

  /**
   * Returns a promisified version of the connection for async/await usage
   * @returns {mysql.Connection.promise|null} Promisified MySQL connection
   */
  getPromise: () => {
    if (!connection) {
      console.warn("Database connection not available for promise operations");
      return null;
    }
    return connection.promise();
  },

  /**
   * Checks if the database connection is active
   * @returns {boolean} True if connection exists and is authenticated
   */
  isConnected: () => {
    return connection && 
           (connection.state === "authenticated" || connection.state === "connected");
  }
};

module.exports = dbSingleton;
