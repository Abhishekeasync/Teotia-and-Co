-- =============================================================================
-- 000_align_legacy_migration_filenames.sql
-- One-time ledger fix for databases migrated before filename convention change.
-- Must run before 001_create_tables.sql (sorts first). Safe on fresh installs.
-- =============================================================================

UPDATE schema_migrations
SET filename = '001_create_tables.sql'
WHERE filename = '001_init.sql';

UPDATE schema_migrations
SET filename = '002_add_indexes.sql'
WHERE filename = '002_indexes.sql';
