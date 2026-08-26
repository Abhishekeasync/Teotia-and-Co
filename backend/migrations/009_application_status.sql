-- =============================================================================
-- 009_application_status.sql — Application lifecycle, closure metadata, history
-- Immutable: do not edit after merge; add a new 00N_*.sql migration instead.
-- Existing application rows are preserved (status defaults to 'applied').
-- =============================================================================

-- Status column
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'job_applications' AND column_name = 'status'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE job_applications ADD COLUMN status ENUM(''applied'',''under_review'',''shortlisted'',''interview'',''selected'',''not_shortlisted'',''withdrawn'',''closed'') NOT NULL DEFAULT ''applied'' AFTER admin_notes',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- closed_at
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'job_applications' AND column_name = 'closed_at'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE job_applications ADD COLUMN closed_at DATETIME NULL AFTER status',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- closed_by_admin_id
SET @col_exists := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema = DATABASE() AND table_name = 'job_applications' AND column_name = 'closed_by_admin_id'
);
SET @sql := IF(
  @col_exists = 0,
  'ALTER TABLE job_applications ADD COLUMN closed_by_admin_id BIGINT UNSIGNED NULL AFTER closed_at',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- FK for closed_by_admin_id
SET @fk_exists := (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE table_schema = DATABASE()
    AND table_name = 'job_applications'
    AND constraint_name = 'fk_job_applications_closed_by'
);
SET @sql := IF(
  @fk_exists = 0,
  'ALTER TABLE job_applications ADD CONSTRAINT fk_job_applications_closed_by FOREIGN KEY (closed_by_admin_id) REFERENCES admins (id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- idx_job_applications_status_created
-- Optimizes: default Active pipeline (status IN (...)) ORDER BY created_at DESC
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'job_applications' AND index_name = 'idx_job_applications_status_created'
);
SET @sql := IF(
  @idx_exists = 0,
  'ALTER TABLE job_applications ADD KEY idx_job_applications_status_created (status, created_at)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- idx_job_applications_job_created
-- Optimizes: job-wise list WHERE job_id = ? ORDER BY created_at DESC
-- uk_job_email is (job_id, email) and cannot serve the created_at sort.
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'job_applications' AND index_name = 'idx_job_applications_job_created'
);
SET @sql := IF(
  @idx_exists = 0,
  'ALTER TABLE job_applications ADD KEY idx_job_applications_job_created (job_id, created_at)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- idx_job_applications_created_at
-- Optimizes: date-range filters (Today / 7d / 30d / custom) without a job filter
SET @idx_exists := (
  SELECT COUNT(*) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'job_applications' AND index_name = 'idx_job_applications_created_at'
);
SET @sql := IF(
  @idx_exists = 0,
  'ALTER TABLE job_applications ADD KEY idx_job_applications_created_at (created_at)',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS job_application_status_history (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  application_id BIGINT UNSIGNED NOT NULL,
  old_status VARCHAR(32) NULL,
  new_status VARCHAR(32) NOT NULL,
  changed_by_admin_id BIGINT UNSIGNED NULL,
  reason VARCHAR(255) NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_app_status_history_app_changed (application_id, changed_at),
  CONSTRAINT fk_app_status_history_app
    FOREIGN KEY (application_id) REFERENCES job_applications (id) ON DELETE CASCADE,
  CONSTRAINT fk_app_status_history_admin
    FOREIGN KEY (changed_by_admin_id) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed history for existing applications that have none (idempotent)
INSERT INTO job_application_status_history (application_id, old_status, new_status, reason, changed_at)
SELECT a.id, NULL, a.status, 'Application submitted', a.created_at
FROM job_applications a
LEFT JOIN job_application_status_history h ON h.application_id = a.id
WHERE h.id IS NULL;
