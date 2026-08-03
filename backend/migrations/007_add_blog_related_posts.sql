-- =============================================================================
-- 007_add_blog_related_posts.sql — Manual related-post associations
-- =============================================================================

CREATE TABLE IF NOT EXISTS blog_related_posts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  blog_id BIGINT UNSIGNED NOT NULL,
  related_blog_id BIGINT UNSIGNED NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_blog_related_pair (blog_id, related_blog_id),
  KEY idx_blog_related_blog_id (blog_id),
  KEY idx_blog_related_related_blog_id (related_blog_id),
  KEY idx_blog_related_sort (blog_id, sort_order),
  CONSTRAINT fk_blog_related_blog FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE CASCADE,
  CONSTRAINT fk_blog_related_related FOREIGN KEY (related_blog_id) REFERENCES blogs (id) ON DELETE CASCADE,
  CONSTRAINT chk_blog_related_not_self CHECK (blog_id <> related_blog_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
