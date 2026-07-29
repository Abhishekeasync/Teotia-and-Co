-- =============================================================================
-- 003_add_blog_images.sql — gallery images per blog (max 5 enforced in API)
-- Immutable: do not edit after merge; add a new 00N_*.sql for changes.
-- =============================================================================

CREATE TABLE IF NOT EXISTS blog_images (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  blog_id BIGINT UNSIGNED NOT NULL,
  url VARCHAR(2048) NOT NULL,
  sort_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_blog_images_blog_sort (blog_id, sort_order),
  CONSTRAINT fk_blog_images_blog FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
