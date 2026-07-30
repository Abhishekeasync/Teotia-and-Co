import { AdminPublicProfile } from '../interfaces/admin.interface';

declare global {
  namespace Express {
    interface Request {
      admin?: Pick<AdminPublicProfile, 'id' | 'email' | 'name'>;
    }
  }
}

export {};
