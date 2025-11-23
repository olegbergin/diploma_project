-- Add schedule_exceptions column to businesses table
-- This column stores holiday closures and special hours as JSON

ALTER TABLE `businesses`
ADD COLUMN `schedule_exceptions` LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
AFTER `schedule`;

-- Update existing businesses to have empty exceptions array
UPDATE `businesses`
SET `schedule_exceptions` = '[]'
WHERE `schedule_exceptions` IS NULL;
