-- =============================================================================
-- 010_remove_blog_heading_unique.sql — Remove unique constraint on blog heading
-- =============================================================================
-- This migration allows multiple blog posts to have the same heading/title.
-- Slugs remain unique for URL purposes, but titles can be duplicated.
-- =============================================================================

-- Drop the unique constraint on blog heading
ALTER TABLE blogs DROP INDEX uk_blogs_heading;
