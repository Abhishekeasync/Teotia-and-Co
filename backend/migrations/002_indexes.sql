-- =============================================================================
-- Performance indexes (migration 002)
-- Applied after tables exist in 001_init.sql.
-- =============================================================================

-- Full-text search on blog titles (visitor search by heading).
ALTER TABLE blogs
  ADD FULLTEXT INDEX ft_blogs_heading (heading);

-- Public blog list: filter published + sort by latest/oldest.
ALTER TABLE blogs
  ADD KEY idx_blogs_status_published (status, published_at DESC);

-- Filter blog list by category.
ALTER TABLE blogs
  ADD KEY idx_blogs_category_id (category_id);

-- Filter blog list by tag (join blog_tags on tag_id).
ALTER TABLE blog_tags
  ADD KEY idx_blog_tags_tag_id (tag_id);

-- Load approved comments for a post; admin queue by status.
ALTER TABLE comments
  ADD KEY idx_comments_blog_status (blog_id, status);

-- Admin dashboard: recent enquiries.
ALTER TABLE enquiries
  ADD KEY idx_enquiries_created_at (created_at DESC);
