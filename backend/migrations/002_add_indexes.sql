-- =============================================================================
-- 002_add_indexes.sql — performance indexes
-- Immutable: do not edit after merge; add a new 00N_*.sql migration instead.
-- Idempotent: each index is created only if missing (information_schema check).
-- =============================================================================

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'blogs' AND index_name = 'ft_blogs_heading'
);
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE blogs ADD FULLTEXT INDEX ft_blogs_heading (heading)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'blogs' AND index_name = 'idx_blogs_status_published'
);
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE blogs ADD KEY idx_blogs_status_published (status, published_at DESC)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'blogs' AND index_name = 'idx_blogs_category_id'
);
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE blogs ADD KEY idx_blogs_category_id (category_id)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'blog_tags' AND index_name = 'idx_blog_tags_tag_id'
);
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE blog_tags ADD KEY idx_blog_tags_tag_id (tag_id)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'comments' AND index_name = 'idx_comments_blog_status'
);
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE comments ADD KEY idx_comments_blog_status (blog_id, status)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'enquiries' AND index_name = 'idx_enquiries_created_at'
);
SET @sql := IF(@idx_exists = 0, 'ALTER TABLE enquiries ADD KEY idx_enquiries_created_at (created_at DESC)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
