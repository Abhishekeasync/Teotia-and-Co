-- Migration: Create blog_views table for tracking 24-hour idempotent views
-- Description: Creates the blog_views table with a unique constraint on blog_id, visitor_hash, and window_start.

CREATE TABLE blog_views (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    blog_id BIGINT UNSIGNED NOT NULL,
    visitor_hash CHAR(64) NOT NULL,
    view_key VARCHAR(64) NOT NULL,
    window_start DATETIME NOT NULL,
    viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_blog_visitor_window (
        blog_id,
        visitor_hash,
        window_start
    ),

    INDEX idx_blog_id (blog_id),
    INDEX idx_viewed_at (viewed_at),

    CONSTRAINT fk_blog_views_blog
        FOREIGN KEY (blog_id)
        REFERENCES blogs(id)
        ON DELETE CASCADE
);
