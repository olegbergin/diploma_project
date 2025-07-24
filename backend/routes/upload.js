// --------------------------------------------------------------
// קובץ העלאת קבצים לשרת (למשל תמונת פרופיל משתמש)
// upload.js – Handle image upload and return its URL
// --------------------------------------------------------------

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = "uploads/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// File validation settings
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// הגדרה לאן שומרים ואיך קוראים לקובץ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      cb(null, uploadsDir);
    } catch (error) {
      cb(new Error("Failed to set upload destination"));
    }
  },
  filename: (req, file, cb) => {
    try {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new Error("Invalid file extension"));
      }
      const name = `${Date.now()}-${Math.random().toString(36).substring(2)}${ext}`;
      cb(null, name);
    } catch (error) {
      cb(new Error("Failed to generate filename"));
    }
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  try {
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error("Invalid file type. Only JPG, PNG, GIF and WebP images are allowed."));
    }
    
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error("Invalid MIME type. Only image files are allowed."));
    }
    
    cb(null, true);
  } catch (error) {
    cb(new Error("File validation failed"));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  }
});

// POST /api/upload
router.post("/", (req, res) => {
  try {
    upload.single("image")(req, res, (err) => {
      try {
        // Handle multer errors
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              error: "File too large. Maximum size is 5MB / קובץ גדול מדי, מקסימום 5MB" 
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ 
              error: "Unexpected field name. Use 'image' / שם שדה לא צפוי, השתמש ב-'image'" 
            });
          }
          return res.status(400).json({ 
            error: `Upload error: ${err.message} / שגיאת העלאה: ${err.message}` 
          });
        }
        
        // Handle custom validation errors
        if (err) {
          return res.status(400).json({ 
            error: err.message || "Upload failed / העלאה נכשלה" 
          });
        }
        
        // Check if file was uploaded
        if (!req.file) {
          return res.status(400).json({ 
            error: "No file uploaded / אין קובץ" 
          });
        }
        
        // Validate file exists on disk
        const filePath = path.join(uploadsDir, req.file.filename);
        if (!fs.existsSync(filePath)) {
          return res.status(500).json({ 
            error: "File upload failed / העלאת קובץ נכשלה" 
          });
        }
        
        // מחזיר את ה-URL היחסי ללקוח
        const fileUrl = `/uploads/${req.file.filename}`;
        res.status(200).json({ 
          url: fileUrl,
          filename: req.file.filename,
          size: req.file.size
        });
        
      } catch (innerError) {
        console.error("Upload processing error:", innerError);
        res.status(500).json({ 
          error: "Internal server error during upload processing / שגיאת שרת פנימית בעיבוד העלאה" 
        });
      }
    });
  } catch (error) {
    console.error("Upload route error:", error);
    res.status(500).json({ 
      error: "Server error / שגיאת שרת" 
    });
  }
});

module.exports = router;
