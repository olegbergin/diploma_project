const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const authRoutes = require("./routes/auth");
const searchRoutes = require("./routes/search");

app.use(cors());
app.use(express.json());

app.use("/api/auth/", authRoutes);
app.use("/api/search", searchRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
