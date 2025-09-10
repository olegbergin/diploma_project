-- =====================================================
-- Review System Database Migration
-- Run this script to add review system functionality
-- =====================================================

-- 1. First, check and add missing columns to reviews table
-- Note: Using IF NOT EXISTS logic for safety

-- Add appointment_id column
SET @dbname = DATABASE();
SET @tablename = 'reviews';
SET @columnname = 'appointment_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT "Column appointment_id already exists" AS message',
  'ALTER TABLE reviews ADD COLUMN appointment_id INT(11) AFTER business_id'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add business_response column
SET @columnname = 'business_response';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT "Column business_response already exists" AS message',
  'ALTER TABLE reviews ADD COLUMN business_response TEXT AFTER text'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add response_date column
SET @columnname = 'response_date';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT "Column response_date already exists" AS message',
  'ALTER TABLE reviews ADD COLUMN response_date TIMESTAMP NULL AFTER business_response'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add is_hidden column
SET @columnname = 'is_hidden';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT "Column is_hidden already exists" AS message',
  'ALTER TABLE reviews ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE AFTER response_date'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add hidden_reason column
SET @columnname = 'hidden_reason';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT "Column hidden_reason already exists" AS message',
  'ALTER TABLE reviews ADD COLUMN hidden_reason VARCHAR(255) NULL AFTER is_hidden'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add updated_at column
SET @columnname = 'updated_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  'SELECT "Column updated_at already exists" AS message',
  'ALTER TABLE reviews ADD COLUMN updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_at'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 2. Create review_complaints table if it doesn't exist
CREATE TABLE IF NOT EXISTS review_complaints (
  complaint_id INT(11) PRIMARY KEY AUTO_INCREMENT,
  review_id INT(11) NOT NULL,
  reporter_id INT(11) NOT NULL,
  complaint_type ENUM('inappropriate', 'fake', 'offensive', 'spam', 'other') NOT NULL,
  complaint_text TEXT,
  status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_review_complaints_review_id (review_id),
  INDEX idx_review_complaints_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Add indexes for performance (check if they exist first)
SET @indexname = 'idx_reviews_business_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'reviews'
      AND INDEX_NAME = @indexname
  ) > 0,
  'SELECT "Index idx_reviews_business_id already exists" AS message',
  'CREATE INDEX idx_reviews_business_id ON reviews(business_id)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @indexname = 'idx_reviews_customer_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'reviews'
      AND INDEX_NAME = @indexname
  ) > 0,
  'SELECT "Index idx_reviews_customer_id already exists" AS message',
  'CREATE INDEX idx_reviews_customer_id ON reviews(customer_id)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @indexname = 'idx_reviews_appointment_id';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'reviews'
      AND INDEX_NAME = @indexname
  ) > 0,
  'SELECT "Index idx_reviews_appointment_id already exists" AS message',
  'CREATE INDEX idx_reviews_appointment_id ON reviews(appointment_id)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

SET @indexname = 'idx_reviews_created_at';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = 'reviews'
      AND INDEX_NAME = @indexname
  ) > 0,
  'SELECT "Index idx_reviews_created_at already exists" AS message',
  'CREATE INDEX idx_reviews_created_at ON reviews(created_at)'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 4. Create or replace view for business review statistics
CREATE OR REPLACE VIEW business_review_stats AS
SELECT 
    b.business_id,
    b.name as business_name,
    COUNT(r.review_id) as total_reviews,
    ROUND(AVG(r.rating), 2) as average_rating,
    COUNT(CASE WHEN r.rating = 5 THEN 1 END) as five_star_count,
    COUNT(CASE WHEN r.rating = 4 THEN 1 END) as four_star_count,
    COUNT(CASE WHEN r.rating = 3 THEN 1 END) as three_star_count,
    COUNT(CASE WHEN r.rating = 2 THEN 1 END) as two_star_count,
    COUNT(CASE WHEN r.rating = 1 THEN 1 END) as one_star_count,
    COUNT(CASE WHEN r.business_response IS NOT NULL THEN 1 END) as responses_count
FROM businesses b
LEFT JOIN reviews r ON b.business_id = r.business_id AND r.is_hidden = FALSE
GROUP BY b.business_id, b.name;

-- 5. Create or replace view for reviewable appointments
CREATE OR REPLACE VIEW reviewable_appointments AS
SELECT 
    a.appointment_id,
    a.customer_id,
    a.business_id,
    a.service_id,
    a.appointment_datetime,
    a.status,
    b.name as business_name,
    s.name as service_name,
    u.first_name,
    u.last_name
FROM appointments a
JOIN businesses b ON a.business_id = b.business_id
JOIN services s ON a.service_id = s.service_id
JOIN users u ON a.customer_id = u.user_id
LEFT JOIN reviews r ON a.appointment_id = r.appointment_id
WHERE a.status = 'completed' 
  AND r.review_id IS NULL
  AND a.appointment_datetime >= DATE_SUB(NOW(), INTERVAL 30 DAY);

-- 6. Show final status
SELECT 'Migration completed successfully!' AS status;

-- 7. Display the updated reviews table structure
DESCRIBE reviews;