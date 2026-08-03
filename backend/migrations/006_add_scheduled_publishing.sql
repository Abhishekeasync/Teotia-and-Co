-- =============================================================================
-- 006_add_scheduled_publishing.sql
-- Add support for scheduled blog publishing.
-- =============================================================================

-- Safely add 'publish_type' column if it doesn't exist
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.columns 
  WHERE table_schema = DATABASE() AND table_name = 'blogs' AND column_name = 'publish_type'
);
SET @sql := IF(@col_exists = 0, 
  'ALTER TABLE blogs ADD COLUMN publish_type ENUM(''draft'', ''publish_now'', ''scheduled'') NOT NULL DEFAULT ''draft'' AFTER status', 
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Safely add 'scheduled_publish_at' column if it doesn't exist
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.columns 
  WHERE table_schema = DATABASE() AND table_name = 'blogs' AND column_name = 'scheduled_publish_at'
);
SET @sql := IF(@col_exists = 0, 
  'ALTER TABLE blogs ADD COLUMN scheduled_publish_at DATETIME NULL AFTER publish_type', 
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Safely add 'scheduler_status' column if it doesn't exist
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.columns 
  WHERE table_schema = DATABASE() AND table_name = 'blogs' AND column_name = 'scheduler_status'
);
SET @sql := IF(@col_exists = 0, 
  'ALTER TABLE blogs ADD COLUMN scheduler_status ENUM(''pending'', ''published'', ''failed'', ''cancelled'') NULL AFTER scheduled_publish_at', 
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index for the scheduler
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'blogs' AND index_name = 'idx_blogs_scheduler'
);
SET @sql := IF(@idx_exists = 0, 
  'ALTER TABLE blogs ADD KEY idx_blogs_scheduler (status, publish_type, scheduler_status, scheduled_publish_at)', 
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
