const express = require("express");
const cors = require("cors");
require("dotenv").config(); // טוען משתני סביבה

// התחברות למסד הנתונים
require("./db"); // Singleton מתבצע עם require

// ייבוא ראוטים
const userRoutes = require("./routes/users");
const businessRoutes = require("./routes/businesses");
const appointmentRoutes = require("./routes/appointments");

const app = express();

// שימוש ב־Middleware
app.use(cors());
app.use(express.json());

// ניתוב API
app.use("/api/users", userRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/appointments", appointmentRoutes);

// הרצת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
