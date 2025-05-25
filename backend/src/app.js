const express = require("express");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

// Connect to the database (singleton)
require("../dbSingleton");

// Import routes
//const userRoutes = require("../../routes/users");
const businessRoutes = require("../routes/businesses");
const appointmentRoutes = require("../routes/appointments");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
//app.use("/api/users", userRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/appointments", appointmentRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
