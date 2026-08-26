import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { acquireConnection } from '../config/database';
import {
  ACTIVE_APPLICATION_STATUSES,
  ApplicationStatus,
  CLOSED_APPLICATION_STATUSES,
  JobApplicationRecord,
  JobApplicationStatusHistoryRecord,
} from '../interfaces/job.interface';
import { PaginationParams } from '../utils/pagination';

export type ApplicationListFilters = {
  jobId?: number;
  search?: string;
  status?: ApplicationStatus;
  pipeline?: 'active' | 'closed' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
};

export type ApplicationListRow = JobApplicationRecord & {
  jobTitle: string;
  jobSlug: string;
  closedByName: string | null;
};

export type JobApplicationSummaryRow = {
  jobId: number;
  jobTitle: string;
  jobSlug: string;
  total: number;
  active: number;
  shortlisted: number;
  interview: number;
  selected: number;
};

type JobApplicationRow = RowDataPacket & {
  id: number;
  job_id: number;
  name: string;
  email: string;
  phone: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  current_company: string | null;
  experience_years: number | null;
  resume_s3_key: string;
  admin_notes: string | null;
  status: ApplicationStatus;
  closed_at: Date | null;
  closed_by_admin_id: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

type ApplicationListSqlRow = JobApplicationRow & {
  job_title: string;
  job_slug: string;
  closed_by_name: string | null;
};

type HistoryRow = RowDataPacket & {
  id: number;
  application_id: number;
  old_status: ApplicationStatus | null;
  new_status: ApplicationStatus;
  changed_by_admin_id: number | null;
  changed_by_name: string | null;
  reason: string | null;
  changed_at: Date;
};

const LIST_SELECT = `
  a.id, a.job_id, a.name, a.email, a.phone,
  a.linkedin_url, a.portfolio_url, a.current_company, a.experience_years,
  a.resume_s3_key, a.admin_notes, a.status, a.closed_at, a.closed_by_admin_id,
  a.created_at, a.updated_at, a.deleted_at,
  j.title AS job_title, j.slug AS job_slug,
  closer.name AS closed_by_name
`;

function mapJobApplication(row: JobApplicationRow): JobApplicationRecord {
  return {
    id: row.id,
    jobId: row.job_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    linkedinUrl: row.linkedin_url,
    portfolioUrl: row.portfolio_url,
    currentCompany: row.current_company,
    experienceYears: row.experience_years ? Number(row.experience_years) : null,
    resumeS3Key: row.resume_s3_key,
    adminNotes: row.admin_notes,
    status: row.status,
    closedAt: row.closed_at,
    closedByAdminId: row.closed_by_admin_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

function mapListRow(row: ApplicationListSqlRow): ApplicationListRow {
  return {
    ...mapJobApplication(row),
    jobTitle: row.job_title,
    jobSlug: row.job_slug,
    closedByName: row.closed_by_name,
  };
}

function buildListWhere(filters: ApplicationListFilters): { where: string; params: unknown[] } {
  const clauses = ['a.deleted_at IS NULL'];
  const params: unknown[] = [];

  if (filters.jobId) {
    clauses.push('a.job_id = ?');
    params.push(filters.jobId);
  }

  if (filters.status) {
    clauses.push('a.status = ?');
    params.push(filters.status);
  } else if (filters.pipeline === 'active') {
    clauses.push(`a.status IN (${ACTIVE_APPLICATION_STATUSES.map(() => '?').join(', ')})`);
    params.push(...ACTIVE_APPLICATION_STATUSES);
  } else if (filters.pipeline === 'closed') {
    clauses.push(`a.status IN (${CLOSED_APPLICATION_STATUSES.map(() => '?').join(', ')})`);
    params.push(...CLOSED_APPLICATION_STATUSES);
  }

  if (filters.dateFrom) {
    clauses.push('a.created_at >= ?');
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    clauses.push('a.created_at <= ?');
    params.push(filters.dateTo);
  }

  const search = filters.search?.trim();
  if (search) {
    const like = `%${search}%`;
    const searchClauses = [
      'a.name LIKE ?',
      'a.email LIKE ?',
      'a.phone LIKE ?',
      'j.title LIKE ?',
    ];
    params.push(like, like, like, like);
    if (/^\d+$/.test(search)) {
      searchClauses.push('a.job_id = ?');
      params.push(Number(search));
    }
    clauses.push(`(${searchClauses.join(' OR ')})`);
  }

  return { where: clauses.join(' AND '), params };
}

export class JobApplicationRepository {
  async create(
    data: Omit<
      JobApplicationRecord,
      | 'id'
      | 'adminNotes'
      | 'status'
      | 'closedAt'
      | 'closedByAdminId'
      | 'createdAt'
      | 'updatedAt'
      | 'deletedAt'
    >,
  ): Promise<number> {
    const connection = await acquireConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO job_applications (
          job_id, name, email, phone, linkedin_url, portfolio_url,
          current_company, experience_years, resume_s3_key, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'applied')`,
        [
          data.jobId,
          data.name,
          data.email,
          data.phone,
          data.linkedinUrl,
          data.portfolioUrl,
          data.currentCompany,
          data.experienceYears,
          data.resumeS3Key,
        ],
      );
      await connection.query(
        `INSERT INTO job_application_status_history (
          application_id, old_status, new_status, reason
        ) VALUES (?, NULL, 'applied', 'Application submitted')`,
        [result.insertId],
      );
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findById(id: number): Promise<ApplicationListRow | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<ApplicationListSqlRow[]>(
        `SELECT ${LIST_SELECT}
         FROM job_applications a
         INNER JOIN jobs j ON j.id = a.job_id
         LEFT JOIN admins closer ON closer.id = a.closed_by_admin_id
         WHERE a.id = ? AND a.deleted_at IS NULL
         LIMIT 1`,
        [id],
      );
      return rows[0] ? mapListRow(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async hasApplied(jobId: number, email: string): Promise<boolean> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT id FROM job_applications WHERE job_id = ? AND email = ? AND deleted_at IS NULL LIMIT 1',
        [jobId, email],
      );
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }

  async listAll(
    pagination: PaginationParams,
    filters: ApplicationListFilters = {},
  ): Promise<ApplicationListRow[]> {
    const { where, params } = buildListWhere(filters);
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<ApplicationListSqlRow[]>(
        `SELECT ${LIST_SELECT}
         FROM job_applications a
         INNER JOIN jobs j ON j.id = a.job_id
         LEFT JOIN admins closer ON closer.id = a.closed_by_admin_id
         WHERE ${where}
         ORDER BY a.created_at DESC, a.id DESC
         LIMIT ? OFFSET ?`,
        [...params, pagination.limit, pagination.offset],
      );
      return rows.map(mapListRow);
    } finally {
      connection.release();
    }
  }

  async countAll(filters: ApplicationListFilters = {}): Promise<number> {
    const { where, params } = buildListWhere(filters);
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT COUNT(*) AS total
         FROM job_applications a
         INNER JOIN jobs j ON j.id = a.job_id
         WHERE ${where}`,
        params,
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  async countByJob(jobId: number): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM job_applications WHERE job_id = ? AND deleted_at IS NULL',
        [jobId],
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  async listJobSummaries(): Promise<JobApplicationSummaryRow[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT
           j.id AS job_id,
           j.title AS job_title,
           j.slug AS job_slug,
           COUNT(a.id) AS total,
           SUM(CASE WHEN a.status IN (${ACTIVE_APPLICATION_STATUSES.map(() => '?').join(', ')}) THEN 1 ELSE 0 END) AS active,
           SUM(CASE WHEN a.status = 'shortlisted' THEN 1 ELSE 0 END) AS shortlisted,
           SUM(CASE WHEN a.status = 'interview' THEN 1 ELSE 0 END) AS interview,
           SUM(CASE WHEN a.status = 'selected' THEN 1 ELSE 0 END) AS selected
         FROM jobs j
         INNER JOIN job_applications a ON a.job_id = j.id AND a.deleted_at IS NULL
         WHERE j.deleted_at IS NULL
         GROUP BY j.id, j.title, j.slug
         ORDER BY total DESC, j.title ASC`,
        [...ACTIVE_APPLICATION_STATUSES],
      );
      return rows.map((row) => ({
        jobId: Number(row.job_id),
        jobTitle: String(row.job_title),
        jobSlug: String(row.job_slug),
        total: Number(row.total ?? 0),
        active: Number(row.active ?? 0),
        shortlisted: Number(row.shortlisted ?? 0),
        interview: Number(row.interview ?? 0),
        selected: Number(row.selected ?? 0),
      }));
    } finally {
      connection.release();
    }
  }

  async listStatusHistory(applicationId: number): Promise<JobApplicationStatusHistoryRecord[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<HistoryRow[]>(
        `SELECT
           h.id, h.application_id, h.old_status, h.new_status,
           h.changed_by_admin_id, admin.name AS changed_by_name,
           h.reason, h.changed_at
         FROM job_application_status_history h
         LEFT JOIN admins admin ON admin.id = h.changed_by_admin_id
         WHERE h.application_id = ?
         ORDER BY h.changed_at DESC, h.id DESC`,
        [applicationId],
      );
      return rows.map((row) => ({
        id: row.id,
        applicationId: row.application_id,
        oldStatus: row.old_status,
        newStatus: row.new_status,
        changedByAdminId: row.changed_by_admin_id,
        changedByName: row.changed_by_name,
        reason: row.reason,
        changedAt: row.changed_at,
      }));
    } finally {
      connection.release();
    }
  }

  async updateStatus(input: {
    id: number;
    newStatus: ApplicationStatus;
    adminId: number;
    reason?: string | null;
    closedAt: Date | null;
    closedByAdminId: number | null;
  }): Promise<ApplicationStatus | null> {
    const connection = await acquireConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query<JobApplicationRow[]>(
        'SELECT * FROM job_applications WHERE id = ? AND deleted_at IS NULL LIMIT 1 FOR UPDATE',
        [input.id],
      );
      const current = rows[0];
      if (!current) {
        await connection.rollback();
        return null;
      }

      await connection.query(
        `INSERT INTO job_application_status_history (
          application_id, old_status, new_status, changed_by_admin_id, reason
        ) VALUES (?, ?, ?, ?, ?)`,
        [input.id, current.status, input.newStatus, input.adminId, input.reason ?? null],
      );

      await connection.query(
        `UPDATE job_applications
         SET status = ?, closed_at = ?, closed_by_admin_id = ?
         WHERE id = ?`,
        [input.newStatus, input.closedAt, input.closedByAdminId, input.id],
      );

      await connection.commit();
      return current.status;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async softDelete(id: number): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('UPDATE job_applications SET deleted_at = NOW() WHERE id = ?', [
        id,
      ]);
    } finally {
      connection.release();
    }
  }

  async updateAdminNotes(id: number, notes: string | null): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('UPDATE job_applications SET admin_notes = ? WHERE id = ?', [
        notes,
        id,
      ]);
    } finally {
      connection.release();
    }
  }
}
