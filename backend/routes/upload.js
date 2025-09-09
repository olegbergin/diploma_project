// --------------------------------------------------------------
// קובץ העלאת קבצים לשרת (למשל תמונת פרופיל משתמש)
// upload.js – Handle image upload and return its URL
// --------------------------------------------------------------

const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const router = express.Router();

// Simple rate limiting for uploads (in-memory store)
const uploadAttempts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_UPLOADS_PER_WINDOW = 20; // 20 uploads per minute per IP

const checkRateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean old entries
  if (uploadAttempts.has(clientIP)) {
    const attempts = uploadAttempts.get(clientIP);
    const recentAttempts = attempts.filter(timestamp => timestamp > windowStart);
    uploadAttempts.set(clientIP, recentAttempts);
    
    if (recentAttempts.length >= MAX_UPLOADS_PER_WINDOW) {
      return res.status(429).json({
        error: "Too many upload attempts. Please wait before trying again. / יותר מדי נסיונות העלאה, אנא המתן."
      });
    }
  } else {
    uploadAttempts.set(clientIP, []);
  }
  
  // Add current attempt
  uploadAttempts.get(clientIP).push(now);
  next();
};

// Image optimization function
const optimizeImage = async (inputPath, outputPath, thumbnailPath) => {
  try {
    // Ensure input and output paths are different
    if (path.resolve(inputPath) === path.resolve(outputPath)) {
      throw new Error('Input and output paths cannot be the same');
    }
    
    // Get image info
    const metadata = await sharp(inputPath).metadata();
    
    // Optimize main image
    const optimizedImage = sharp(inputPath);
    
    // Resize if too large (max 1920x1920)
    if (metadata.width > 1920 || metadata.height > 1920) {
      optimizedImage.resize(1920, 1920, { 
        fit: 'inside', 
        withoutEnlargement: true 
      });
    }
    
    // Convert to WebP for better compression, fallback to JPEG
    await optimizedImage
      .webp({ quality: 85, effort: 4 })
      .toFile(outputPath);
    
    // Create thumbnail (300x300)
    await sharp(inputPath)
      .resize(300, 300, { 
        fit: 'cover', 
        position: 'center' 
      })
      .webp({ quality: 80, effort: 4 })
      .toFile(thumbnailPath);
    
    // Delete original if optimization succeeded and it's different from output
    if (inputPath !== outputPath && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
    
    return {
      optimized: true,
      originalSize: metadata.size,
      optimizedSize: fs.statSync(outputPath).size,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      }
    };
  } catch (error) {
    console.error('Image optimization failed:', error);
    // If optimization fails, keep original
    return {
      optimized: false,
      error: error.message
    };
  }
};

// Ensure uploads directory exists
const uploadsDir = "uploads/";
const thumbnailsDir = "uploads/thumbnails/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// File validation settings
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES_PER_REQUEST = 10; // Maximum 10 files per upload request
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
    files: MAX_FILES_PER_REQUEST,
    fieldSize: 2 * 1024 * 1024 // 2MB for field data
  }
});

// POST /api/upload
router.post("/", checkRateLimit, (req, res) => {
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
        const originalFilePath = path.join(uploadsDir, req.file.filename);
        if (!fs.existsSync(originalFilePath)) {
          return res.status(500).json({ 
            error: "File upload failed / העלאת קובץ נכשלה" 
          });
        }
        
        // Optimize image asynchronously
        (async () => {
          try {
            const originalExt = path.extname(req.file.filename);
            const nameWithoutExt = path.parse(req.file.filename).name;
            
            // Create unique optimized filename to avoid conflicts
            const optimizedFilename = originalExt.toLowerCase() === '.webp' 
              ? `opt_${nameWithoutExt}.webp`
              : `${nameWithoutExt}.webp`;
            const thumbnailFilename = `thumb_${nameWithoutExt}.webp`;
            
            const optimizedPath = path.join(uploadsDir, optimizedFilename);
            const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
            
            const optimizationResult = await optimizeImage(
              originalFilePath,
              optimizedPath,
              thumbnailPath
            );
            
            console.log(`Image optimization result for ${req.file.filename}:`, optimizationResult);
            
            // Return optimized filename if successful, otherwise original
            const finalFilename = optimizationResult.optimized ? optimizedFilename : req.file.filename;
            const fileUrl = `/uploads/${finalFilename}`;
            const thumbnailUrl = optimizationResult.optimized ? `/uploads/thumbnails/${thumbnailFilename}` : fileUrl;
            
            res.status(200).json({ 
              url: fileUrl,
              thumbnailUrl: thumbnailUrl,
              filename: finalFilename,
              originalSize: req.file.size,
              optimizedSize: optimizationResult.optimizedSize || req.file.size,
              dimensions: optimizationResult.dimensions,
              optimized: optimizationResult.optimized
            });
            
          } catch (optimizationError) {
            console.error('Optimization error:', optimizationError);
            // Return original file if optimization fails
            const fileUrl = `/uploads/${req.file.filename}`;
            res.status(200).json({ 
              url: fileUrl,
              filename: req.file.filename,
              size: req.file.size,
              optimized: false,
              error: 'Optimization failed, using original file'
            });
          }
        })();
        
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
