// dbSingleton.js
const mysql = require("mysql2");

let connection = null; // Initialize connection as null
let isConnecting = false; // Flag to prevent multiple connection attempts

const dbConfig = {
  host: process.env.DB_HOST || "localhost", // Use environment variables
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "project_db",
  charset: "utf8mb4", // Good for international characters
};

function establishConnection() {
  if (connection && connection.state === "authenticated") {
    // Check if already connected and authenticated
    console.log("Already connected to MySQL.");
    return connection;
  }

  if (isConnecting) {
    console.log("Connection attempt already in progress.");
    // Optionally, return a promise that resolves when connection is established,
    // or simply let subsequent calls wait / fail. For simplicity, we don't add complex queueing here.
    return null; // Or handle this case as needed
  }

  isConnecting = true;
  console.log("Attempting to connect to MySQL...");
  const newConnection = mysql.createConnection(dbConfig);

  newConnection.connect((err) => {
    isConnecting = false; // Reset flag regardless of outcome
    if (err) {
      console.error("Error connecting to database:", err.message);
      connection = null; // Ensure connection is null on failure
      // throw err; // Throwing here might crash the app if not handled by caller
      return;
    }
    console.log(
      "Successfully connected to MySQL as id " + newConnection.threadId
    );
    connection = newConnection; // Assign the successfully established connection

    // Handle connection errors after successful connection
    connection.on("error", (error) => {
      console.error("Database connection error:", error.message);
      if (
        error.code === "PROTOCOL_CONNECTION_LOST" ||
        error.code === "ECONNRESET"
      ) {
        console.log("Connection lost. Setting connection to null.");
        connection = null; // Invalidate the connection
        // Optionally, attempt to reconnect or implement a more robust strategy
      } else {
        // For other errors, you might not want to nullify the connection immediately
        // throw error; // Or handle as appropriate
      }
    });
  });
  // Note: newConnection.connect is asynchronous.
  // The `connection` variable might not be set immediately when getConnection is first called.
  // This singleton pattern with mysql.createConnection has its limitations for initial calls.
  // A pool (`mysql.createPool`) is generally more robust.
  return newConnection; // Return the connection object being connected
}

const dbSingleton = {
  getConnection: () => {
    // If connection is lost or not established, try to establish it.
    // This is a very basic retry, a pool handles this much better.
    if (
      !connection ||
      (connection.state !== "authenticated" && connection.state !== "connected")
    ) {
      console.log(
        "Connection not available or lost, attempting to establish a new one."
      );
      return establishConnection(); // This will set the global `connection` if successful
    }
    return connection; // Return the current (hopefully valid) connection
  },
};

module.exports = dbSingleton;
