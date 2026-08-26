-- =============================================================================
-- 008_add_careers.sql — Add Careers/Jobs module
-- =============================================================================

CREATE TABLE IF NOT EXISTS jobs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  department VARCHAR(100) NULL,
  location VARCHAR(100) NULL,
  work_mode ENUM('On-site', 'Hybrid', 'Remote') NOT NULL,
  employment_type VARCHAR(100) NULL,
  experience_required VARCHAR(100) NULL,
  salary_ctc VARCHAR(100) NULL,
  number_of_openings INT NULL,
  description LONGTEXT NOT NULL,
  responsibilities LONGTEXT NULL,
  requirements LONGTEXT NULL,
  required_skills LONGTEXT NULL,
  status ENUM('draft', 'published', 'closed') NOT NULL DEFAULT 'draft',
  created_by_admin_id BIGINT UNSIGNED NULL,
  published_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uk_jobs_slug (slug),
  KEY idx_jobs_deleted_at (deleted_at),
  CONSTRAINT fk_jobs_admin FOREIGN KEY (created_by_admin_id) REFERENCES admins (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_applications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  job_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  linkedin_url VARCHAR(500) NULL,
  portfolio_url VARCHAR(500) NULL,
  current_company VARCHAR(255) NULL,
  experience_years DECIMAL(4,1) NULL,
  resume_s3_key VARCHAR(1024) NOT NULL,
  admin_notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  UNIQUE KEY uk_job_email (job_id, email),
  KEY idx_job_applications_deleted_at (deleted_at),
  CONSTRAINT fk_job_applications_job FOREIGN KEY (job_id) REFERENCES jobs (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
