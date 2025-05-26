const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const authRoutes = require("../routes/auth");
const searchRoutes = require("../routes/search");
const businessRoutes = require("../routes/businesses");

app.use(cors());
app.use(express.json());

// API routes
//app.use("/api/users", userRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/auth/", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/appointments", require("../routes/appointments"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
