const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const authRoutes = require("../routes/auth");
const searchRoutes = require("../routes/search");
const businessRoutes = require("../routes/businesses");
const appointmentRoutes = require("../routes/appointments");

// API routes
app.use("/api/businesses", businessRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/appointments", appointmentRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.message,
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
