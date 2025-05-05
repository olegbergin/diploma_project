const mysql = require("mysql2");

class Database {
  constructor() {
    if (!Database.instance) {
      this.connection = mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "appointments_db",
      });

      this.connection.connect((err) => {
        if (err) {
          console.error("Error connecting to MySQL:", err);
        } else {
          console.log("Connected to MySQL");
        }
      });

      Database.instance = this;
    }

    return Database.instance;
  }

  getConnection() {
    return this.connection;
  }
}

const instance = new Database();
Object.freeze(instance);

module.exports = instance;
