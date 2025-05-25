const mysql = require("mysql2/promise"); 

let connection; // Singleton connection

const dbSingleton = {
  getConnection: async () => {
    if (!connection) {
      try {
        connection = await mysql.createConnection({
          host: "localhost",
          user: "root",
          password: "",
          database: "project_db",
        });

        console.log("✅ Connected to MySQL (Promise-based)!");
      } catch (err) {
        console.error("❌ Failed to connect to MySQL:", err);
        throw err;
      }
    }

    return connection;
  },
};

module.exports = dbSingleton;
