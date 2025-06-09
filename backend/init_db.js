const mysql = require("mysql2/promise");

async function initializeDatabase() {
  let connection;
  try {
    // Create connection without database selected
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
    });

    // Create database if it doesn't exist
    await connection.query("CREATE DATABASE IF NOT EXISTS project_db");
    console.log("✅ Database created or already exists");

    // Use the database
    await connection.query("USE project_db");

    // Create businesses table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS businesses (
        business_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        description TEXT,
        location VARCHAR(255),
        photos TEXT,
        schedule TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Businesses table created or already exists");

    // Create reviews table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        review_id INT AUTO_INCREMENT PRIMARY KEY,
        business_id INT,
        rating INT CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (business_id) REFERENCES businesses(business_id)
      )
    `);
    console.log("✅ Reviews table created or already exists");

    // Insert some sample data if businesses table is empty
    const [rows] = await connection.query(
      "SELECT COUNT(*) as count FROM businesses"
    );
    if (rows[0].count === 0) {
      await connection.query(`
        INSERT INTO businesses (name, category, description, location) VALUES
        ('Beauty Salon A', 'סלון יופי', 'A great beauty salon', 'Tel Aviv'),
        ('Restaurant B', 'מסעדה', 'Delicious food', 'Jerusalem'),
        ('Hair Salon C', 'מספרה', 'Professional hair styling', 'Haifa')
      `);
      console.log("✅ Sample businesses inserted");

      // Insert some sample reviews
      await connection.query(`
        INSERT INTO reviews (business_id, rating, comment) VALUES
        (1, 5, 'Excellent service!'),
        (1, 4, 'Very good'),
        (2, 5, 'Amazing food'),
        (3, 4, 'Great haircut')
      `);
      console.log("✅ Sample reviews inserted");
    }

    console.log("✅ Database initialization completed successfully");
  } catch (err) {
    console.error("Error initializing database:", err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the initialization
initializeDatabase();
