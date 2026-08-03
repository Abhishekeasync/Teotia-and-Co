-- =============================================================================
-- 005_seed_default_categories.sql — ensure baseline categories exist
-- =============================================================================

INSERT IGNORE INTO categories (name, slug) VALUES
  ('General', 'general'),
  ('Tax Advisory', 'tax-advisory'),
  ('Audit & Assurance', 'audit-assurance'),
  ('Corporate Finance', 'corporate-finance'),
  ('Compliance', 'compliance');
