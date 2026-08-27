import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { acquireConnection } from '../config/database';
import { JobRecord, JobStatus, WorkMode } from '../interfaces/job.interface';
import { PaginationParams } from '../utils/pagination';

type JobRow = RowDataPacket & {
  id: number;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  work_mode: WorkMode;
  employment_type: string | null;
  experience_required: string | null;
  salary_ctc: string | null;
  number_of_openings: number | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  required_skills: string | null;
  status: JobStatus;
  created_by_admin_id: number | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
};

function mapJob(row: JobRow): JobRecord {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    department: row.department,
    location: row.location,
    workMode: row.work_mode,
    employmentType: row.employment_type,
    experienceRequired: row.experience_required,
    salaryCtc: row.salary_ctc,
    numberOfOpenings: row.number_of_openings,
    description: row.description,
    responsibilities: row.responsibilities,
    requirements: row.requirements,
    requiredSkills: row.required_skills,
    status: row.status,
    createdByAdminId: row.created_by_admin_id,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at,
  };
}

export class JobRepository {
  async create(
    data: Omit<
      JobRecord,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'publishedAt'
    >,
  ): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO jobs (
          title, slug, department, location, work_mode, employment_type,
          experience_required, salary_ctc, number_of_openings, description,
          responsibilities, requirements, required_skills, status, created_by_admin_id,
          published_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.title,
          data.slug,
          data.department,
          data.location,
          data.workMode,
          data.employmentType,
          data.experienceRequired,
          data.salaryCtc,
          data.numberOfOpenings,
          data.description,
          data.responsibilities,
          data.requirements,
          data.requiredSkills,
          data.status,
          data.createdByAdminId,
          data.status === 'published' ? new Date() : null,
        ],
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  async update(
    id: number,
    data: Omit<
      JobRecord,
      'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'publishedAt' | 'createdByAdminId'
    >,
  ): Promise<void> {
    const connection = await acquireConnection();
    try {
      const [current] = await connection.query<JobRow[]>(
        'SELECT status, published_at FROM jobs WHERE id = ?',
        [id],
      );
      if (!current[0]) return;

      let publishedAt = current[0].published_at;
      if (data.status === 'published' && current[0].status !== 'published' && !publishedAt) {
        publishedAt = new Date();
      }

      await connection.query(
        `UPDATE jobs SET
          title = ?, slug = ?, department = ?, location = ?, work_mode = ?,
          employment_type = ?, experience_required = ?, salary_ctc = ?,
          number_of_openings = ?, description = ?, responsibilities = ?,
          requirements = ?, required_skills = ?, status = ?, published_at = ?
         WHERE id = ?`,
        [
          data.title,
          data.slug,
          data.department,
          data.location,
          data.workMode,
          data.employmentType,
          data.experienceRequired,
          data.salaryCtc,
          data.numberOfOpenings,
          data.description,
          data.responsibilities,
          data.requirements,
          data.requiredSkills,
          data.status,
          publishedAt,
          id,
        ],
      );
    } finally {
      connection.release();
    }
  }

  async updateStatus(id: number, status: JobStatus): Promise<void> {
    const connection = await acquireConnection();
    try {
      const [current] = await connection.query<JobRow[]>(
        'SELECT status, published_at FROM jobs WHERE id = ?',
        [id],
      );
      if (!current[0]) return;

      let publishedAt = current[0].published_at;
      if (status === 'published' && current[0].status !== 'published' && !publishedAt) {
        publishedAt = new Date();
      }

      await connection.query(
        'UPDATE jobs SET status = ?, published_at = ? WHERE id = ?',
        [status, publishedAt, id],
      );
    } finally {
      connection.release();
    }
  }

  async findById(id: number): Promise<JobRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<JobRow[]>(
        'SELECT * FROM jobs WHERE id = ? AND deleted_at IS NULL LIMIT 1',
        [id],
      );
      return rows[0] ? mapJob(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async findBySlug(slug: string): Promise<JobRecord | null> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<JobRow[]>(
        'SELECT * FROM jobs WHERE slug = ? AND deleted_at IS NULL LIMIT 1',
        [slug],
      );
      return rows[0] ? mapJob(rows[0]) : null;
    } finally {
      connection.release();
    }
  }

  async listAll(pagination: PaginationParams): Promise<JobRecord[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<JobRow[]>(
        `SELECT * FROM jobs
         WHERE deleted_at IS NULL
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [pagination.limit, pagination.offset],
      );
      return rows.map(mapJob);
    } finally {
      connection.release();
    }
  }

  async countAll(): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT COUNT(*) AS total FROM jobs WHERE deleted_at IS NULL',
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  async listPublished(pagination: PaginationParams): Promise<JobRecord[]> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<JobRow[]>(
        `SELECT * FROM jobs
         WHERE status = 'published' AND deleted_at IS NULL
         ORDER BY published_at DESC
         LIMIT ? OFFSET ?`,
        [pagination.limit, pagination.offset],
      );
      return rows.map(mapJob);
    } finally {
      connection.release();
    }
  }

  async countPublished(): Promise<number> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        "SELECT COUNT(*) AS total FROM jobs WHERE status = 'published' AND deleted_at IS NULL",
      );
      return Number(rows[0]?.total ?? 0);
    } finally {
      connection.release();
    }
  }

  async softDelete(id: number): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query('UPDATE jobs SET deleted_at = NOW() WHERE id = ?', [id]);
    } finally {
      connection.release();
    }
  }

  async isSlugTaken(slug: string, excludeId?: number): Promise<boolean> {
    const connection = await acquireConnection();
    try {
      const [rows] = await connection.query<RowDataPacket[]>(
        `SELECT id FROM jobs WHERE slug = ? AND (? IS NULL OR id != ?) LIMIT 1`,
        [slug, excludeId ?? null, excludeId ?? null],
      );
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }
}
