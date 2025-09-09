// --------------------------------------------------------------
// Image cleanup utility routes
// cleanup.js - Handle cleanup of unused uploaded files
// --------------------------------------------------------------

const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require('../dbSingleton');
const router = express.Router();

const uploadsDir = path.join(__dirname, "../uploads/");
const thumbnailsDir = path.join(__dirname, "../uploads/thumbnails/");

// Get all image URLs referenced in database
const getReferencedImages = async () => {
  try {
    const connection = db.getPromise();
    
    // Get all photos from businesses table
    const [businessRows] = await connection.query('SELECT photos FROM businesses WHERE photos IS NOT NULL AND photos != "[]"');
    
    // Extract all image URLs
    const referencedImages = new Set();
    
    businessRows.forEach(row => {
      try {
        const photos = JSON.parse(row.photos);
        if (Array.isArray(photos)) {
          photos.forEach(photo => {
            if (typeof photo === 'string' && photo.startsWith('/uploads/')) {
              // Extract filename from URL
              const filename = path.basename(photo);
              referencedImages.add(filename);
              
              // Also add corresponding thumbnail if it exists
              const nameWithoutExt = path.parse(filename).name;
              const thumbnailName = `thumb_${nameWithoutExt}.webp`;
              referencedImages.add(thumbnailName);
            }
          });
        }
      } catch (parseError) {
        console.warn('Failed to parse photos JSON:', row.photos);
      }
    });
    
    // TODO: Add other tables that might reference images (users profile pics, etc.)
    
    return Array.from(referencedImages);
  } catch (error) {
    console.error('Error getting referenced images:', error);
    return [];
  }
};

// Find orphaned (unused) files
const findOrphanedFiles = async () => {
  try {
    const referencedImages = await getReferencedImages();
    const referencedSet = new Set(referencedImages);
    
    const orphanedFiles = [];
    
    // Check main uploads directory
    if (fs.existsSync(uploadsDir)) {
      const uploadedFiles = fs.readdirSync(uploadsDir);
      uploadedFiles.forEach(file => {
        if (!referencedSet.has(file)) {
          orphanedFiles.push({
            path: path.join(uploadsDir, file),
            filename: file,
            type: 'main',
            size: fs.statSync(path.join(uploadsDir, file)).size
          });
        }
      });
    }
    
    // Check thumbnails directory
    if (fs.existsSync(thumbnailsDir)) {
      const thumbnailFiles = fs.readdirSync(thumbnailsDir);
      thumbnailFiles.forEach(file => {
        if (!referencedSet.has(file)) {
          orphanedFiles.push({
            path: path.join(thumbnailsDir, file),
            filename: file,
            type: 'thumbnail',
            size: fs.statSync(path.join(thumbnailsDir, file)).size
          });
        }
      });
    }
    
    return orphanedFiles;
  } catch (error) {
    console.error('Error finding orphaned files:', error);
    return [];
  }
};

// GET /api/cleanup/orphaned - List orphaned files (admin only)
router.get('/orphaned', async (req, res) => {
  try {
    // TODO: Add authentication check for admin role
    
    const orphanedFiles = await findOrphanedFiles();
    const totalSize = orphanedFiles.reduce((sum, file) => sum + file.size, 0);
    
    res.json({
      count: orphanedFiles.length,
      totalSize: totalSize,
      totalSizeMB: Math.round(totalSize / (1024 * 1024) * 100) / 100,
      files: orphanedFiles.map(file => ({
        filename: file.filename,
        type: file.type,
        size: file.size,
        sizeMB: Math.round(file.size / (1024 * 1024) * 100) / 100
      }))
    });
  } catch (error) {
    console.error('Error listing orphaned files:', error);
    res.status(500).json({
      error: 'Failed to list orphaned files / שגיאה ברשימת קבצים לא מנוצלים'
    });
  }
});

// DELETE /api/cleanup/orphaned - Clean up orphaned files (admin only)
router.delete('/orphaned', async (req, res) => {
  try {
    // TODO: Add authentication check for admin role
    
    const orphanedFiles = await findOrphanedFiles();
    let deletedCount = 0;
    let errors = [];
    
    orphanedFiles.forEach(file => {
      try {
        fs.unlinkSync(file.path);
        deletedCount++;
      } catch (deleteError) {
        console.error(`Failed to delete ${file.filename}:`, deleteError);
        errors.push({
          filename: file.filename,
          error: deleteError.message
        });
      }
    });
    
    res.json({
      deleted: deletedCount,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    console.error('Error cleaning up orphaned files:', error);
    res.status(500).json({
      error: 'Failed to clean up orphaned files / שגיאה במחיקת קבצים לא מנוצלים'
    });
  }
});

// DELETE /api/cleanup/old - Clean up old files (older than specified days)
router.delete('/old/:days', async (req, res) => {
  try {
    // TODO: Add authentication check for admin role
    
    const days = parseInt(req.params.days) || 30;
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    let deletedCount = 0;
    let errors = [];
    
    // Function to clean directory
    const cleanDirectory = (dirPath) => {
      if (!fs.existsSync(dirPath)) return;
      
      const files = fs.readdirSync(dirPath);
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          try {
            fs.unlinkSync(filePath);
            deletedCount++;
          } catch (deleteError) {
            console.error(`Failed to delete old file ${file}:`, deleteError);
            errors.push({
              filename: file,
              error: deleteError.message
            });
          }
        }
      });
    };
    
    cleanDirectory(uploadsDir);
    cleanDirectory(thumbnailsDir);
    
    res.json({
      cutoffDate: cutoffDate.toISOString(),
      deleted: deletedCount,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    console.error('Error cleaning up old files:', error);
    res.status(500).json({
      error: 'Failed to clean up old files / שגיאה במחיקת קבצים ישנים'
    });
  }
});

// GET /api/cleanup/stats - Get storage statistics
router.get('/stats', async (req, res) => {
  try {
    const getDirectorySize = (dirPath) => {
      if (!fs.existsSync(dirPath)) return { count: 0, size: 0 };
      
      const files = fs.readdirSync(dirPath);
      let totalSize = 0;
      
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      });
      
      return {
        count: files.length,
        size: totalSize
      };
    };
    
    const uploadsStats = getDirectorySize(uploadsDir);
    const thumbnailsStats = getDirectorySize(thumbnailsDir);
    const referencedImages = await getReferencedImages();
    const orphanedFiles = await findOrphanedFiles();
    
    res.json({
      uploads: {
        count: uploadsStats.count,
        size: uploadsStats.size,
        sizeMB: Math.round(uploadsStats.size / (1024 * 1024) * 100) / 100
      },
      thumbnails: {
        count: thumbnailsStats.count,
        size: thumbnailsStats.size,
        sizeMB: Math.round(thumbnailsStats.size / (1024 * 1024) * 100) / 100
      },
      referenced: {
        count: referencedImages.length
      },
      orphaned: {
        count: orphanedFiles.length,
        size: orphanedFiles.reduce((sum, file) => sum + file.size, 0)
      },
      total: {
        count: uploadsStats.count + thumbnailsStats.count,
        size: uploadsStats.size + thumbnailsStats.size,
        sizeMB: Math.round((uploadsStats.size + thumbnailsStats.size) / (1024 * 1024) * 100) / 100
      }
    });
  } catch (error) {
    console.error('Error getting storage stats:', error);
    res.status(500).json({
      error: 'Failed to get storage statistics / שגיאה בקבלת סטטיסטיקות אחסון'
    });
  }
});

module.exports = router;