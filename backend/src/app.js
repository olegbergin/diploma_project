const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
require("dotenv").config();

const authRoutes = require("../routes/auth");
const searchRoutes = require("../routes/search");
const businessRoutes = require("../routes/businesses");
const userRoutes = require("../routes/users");
const appointmentRoutes = require("../routes/appointments");
const adminRoutes = require("../routes/admin");
const reviewRoutes = require("../routes/reviews");
const reportsRoutes = require("../routes/reports");
const cleanupRoutes = require("../routes/cleanup");
const reminderService = require("../services/reminderService");

app.use(cors());
app.use(express.json());

// Static files middleware for serving uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use("/api/users", userRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/auth/", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", reportsRoutes); // Reports routes (handles /api/businesses/:id/reports/*)
app.use("/api/upload", require("../routes/upload"));
app.use("/api/cleanup", cleanupRoutes);

const PORT = process.env.PORT || 3031;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} and accessible from external connections`);

  // Initialize reminder service for appointment notifications
  try {
    reminderService.start();
    console.log('✅ Reminder service initialized successfully');
  } catch (error) {
    console.error('❌ Failed to start reminder service:', error.message);
  }
});
