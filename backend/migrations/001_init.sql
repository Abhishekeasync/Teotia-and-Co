-- =============================================================================
-- TEOTIA & CO. Blog CMS — initial schema (MySQL 8.0)
-- Run via: npm run migrate  (applies 001, then 002, once each)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- schema_migrations
-- Tracks which .sql files already ran so "npm run migrate" is safe to re-run.
-- One row per file (e.g. 001_init.sql, 002_indexes.sql).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schema_migrations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_schema_migrations_filename (filename)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- ADMIN & AUTH (Phase 3)
-- Only CMS admins log in — not public visitors.
-- -----------------------------------------------------------------------------

-- CMS users who can create/edit/publish blogs.
-- last_verified_at: last successful OTP check (OTP required again after 7 days).
-- deleted_at: soft delete — row kept, admin cannot log in.
CREATE TABLE IF NOT EXISTS admins (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  last_verified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uk_admins_email (email),
  KEY idx_admins_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- One-time codes emailed at login (hashed, not stored plain text).
-- consumed_at set when OTP is used successfully.
CREATE TABLE IF NOT EXISTS otp_verifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id BIGINT UNSIGNED NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  consumed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_otp_admin_expires (admin_id, expires_at),
  CONSTRAINT fk_otp_admin FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit trail: every login attempt (success or failure), IP + browser.
-- Useful even with one admin — detects wrong passwords / suspicious access.
CREATE TABLE IF NOT EXISTS login_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  admin_id BIGINT UNSIGNED NOT NULL,
  ip VARCHAR(45) NULL,
  user_agent VARCHAR(512) NULL,
  success TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_login_history_admin_created (admin_id, created_at),
  CONSTRAINT fk_login_history_admin FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- BLOG CONTENT
-- -----------------------------------------------------------------------------

-- Single broad bucket per post (e.g. Taxation, GST) — shown on blog cards.
CREATE TABLE IF NOT EXISTS categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_categories_name (name),
  UNIQUE KEY uk_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Many keywords per post (filter/search). Normalized lowercase names.
CREATE TABLE IF NOT EXISTS tags (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_tags_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Main article table. heading + slug must be unique site-wide.
-- view_count: used for "popular" sort — shown to admin only, not public API.
-- author_name: display byline (defaults from admin, overridable per post).
CREATE TABLE IF NOT EXISTS blogs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  heading VARCHAR(500) NOT NULL,
  slug VARCHAR(520) NOT NULL,
  short_description TEXT NOT NULL,
  body LONGTEXT NOT NULL,
  featured_image_url VARCHAR(2048) NULL,
  meta_title VARCHAR(500) NULL,
  meta_description TEXT NULL,
  canonical_url VARCHAR(2048) NULL,
  og_image_url VARCHAR(2048) NULL,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  category_id BIGINT UNSIGNED NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  created_by_admin_id BIGINT UNSIGNED NULL,
  view_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uk_blogs_heading (heading),
  UNIQUE KEY uk_blogs_slug (slug),
  KEY idx_blogs_deleted_at (deleted_at),
  CONSTRAINT fk_blogs_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE RESTRICT,
  CONSTRAINT fk_blogs_admin FOREIGN KEY (created_by_admin_id) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Links blogs ↔ tags (many-to-many).
CREATE TABLE IF NOT EXISTS blog_tags (
  blog_id BIGINT UNSIGNED NOT NULL,
  tag_id BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (blog_id, tag_id),
  CONSTRAINT fk_blog_tags_blog FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE CASCADE,
  CONSTRAINT fk_blog_tags_tag FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Visitor comments. Default pending — admin must approve before public sees them.
CREATE TABLE IF NOT EXISTS comments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  blog_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  comment TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  approved_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_comments_deleted_at (deleted_at),
  CONSTRAINT fk_comments_blog FOREIGN KEY (blog_id) REFERENCES blogs (id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- PUBLIC ENGAGEMENT
-- -----------------------------------------------------------------------------

-- Newsletter emails. unsubscribed_at set when user clicks unsubscribe link (row kept).
CREATE TABLE IF NOT EXISTS subscribers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NULL,
  unsubscribed_at DATETIME NULL,
  unsubscribe_token CHAR(36) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_subscribers_email (email),
  UNIQUE KEY uk_subscribers_token (unsubscribe_token),
  KEY idx_subscribers_unsubscribed (unsubscribed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contact form submissions.
-- service_type: form select value (e.g. "tax"). subject: human-readable label.
CREATE TABLE IF NOT EXISTS enquiries (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  KEY idx_enquiries_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
