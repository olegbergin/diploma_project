-- Review System Database Extensions
-- Adds missing functionality to support comprehensive review system

-- 1. Add missing columns to existing reviews table
ALTER TABLE reviews 
ADD COLUMN appointment_id INT(11) AFTER business_id,
ADD COLUMN business_response TEXT AFTER text,
ADD COLUMN response_date TIMESTAMP NULL AFTER business_response,
ADD COLUMN is_hidden BOOLEAN DEFAULT FALSE AFTER response_date,
ADD COLUMN hidden_reason VARCHAR(255) NULL AFTER is_hidden,
ADD COLUMN updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP AFTER created_at;

-- 2. Create complaints table for review reports
CREATE TABLE review_complaints (
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
  FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Add foreign key constraints to reviews table (if not exists)
ALTER TABLE reviews 
ADD CONSTRAINT fk_reviews_customer 
  FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_reviews_business 
  FOREIGN KEY (business_id) REFERENCES businesses(business_id) ON DELETE CASCADE,
ADD CONSTRAINT fk_reviews_appointment 
  FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL;

-- 4. Create indexes for performance
CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_appointment_id ON reviews(appointment_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_review_complaints_review_id ON review_complaints(review_id);
CREATE INDEX idx_review_complaints_status ON review_complaints(status);

-- 5. Add constraint to ensure rating is between 1-5
ALTER TABLE reviews 
ADD CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5);

-- 6. Create a view for business review statistics
CREATE VIEW business_review_stats AS
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

-- 7. Create a view for reviewable appointments (completed, no existing review)
CREATE VIEW reviewable_appointments AS
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
  AND a.appointment_datetime >= DATE_SUB(NOW(), INTERVAL 30 DAY); -- Reviews allowed within 30 days

-- Sample data update for existing reviews to link with appointments
-- This will link some existing reviews with completed appointments
UPDATE reviews r
JOIN (
    SELECT 
        r2.review_id,
        a.appointment_id
    FROM reviews r2
    JOIN appointments a ON r2.customer_id = a.customer_id 
                        AND r2.business_id = a.business_id
                        AND a.status = 'completed'
    WHERE r2.appointment_id IS NULL
    GROUP BY r2.review_id
    HAVING MIN(a.appointment_datetime) -- Link to earliest completed appointment if multiple exist
) linked ON r.review_id = linked.review_id
SET r.appointment_id = linked.appointment_id;