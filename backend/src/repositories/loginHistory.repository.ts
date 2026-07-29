import { ResultSetHeader } from 'mysql2';
import { acquireConnection } from '../config/database';

export class LoginHistoryRepository {
  async record(
    adminId: number,
    success: boolean,
    ip: string | null,
    userAgent: string | null,
  ): Promise<void> {
    const connection = await acquireConnection();
    try {
      await connection.query<ResultSetHeader>(
        `INSERT INTO login_history (admin_id, ip, user_agent, success) VALUES (?, ?, ?, ?)`,
        [adminId, ip, userAgent, success ? 1 : 0],
      );
    } finally {
      connection.release();
    }
  }
}
