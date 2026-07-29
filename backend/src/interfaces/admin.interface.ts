export type AdminRecord = {
  id: number;
  email: string;
  passwordHash: string;
  name: string;
  lastVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type AdminPublicProfile = {
  id: number;
  email: string;
  name: string;
  lastVerifiedAt: string | null;
};

export type JwtAdminPayload = {
  sub: number;
  email: string;
};
