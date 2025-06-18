// --------------------------------------------------------------
// קובץ העלאת קבצים לשרת (למשל תמונת פרופיל משתמש)
// upload.js – Handle image upload and return its URL
// --------------------------------------------------------------

const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// הגדרה לאן שומרים ואיך קוראים לקובץ
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + ext;
    cb(null, name);
  },
});

const upload = multer({ storage });

// POST /api/upload
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "אין קובץ" });
  }
  // מחזיר את ה-URL היחסי ללקוח
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

module.exports = router;
