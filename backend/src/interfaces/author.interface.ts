export type AuthorSummary = {
  id: number;
  name: string;
  slug: string;
  designation: string | null;
  profileImageUrl: string | null;
};

export type AuthorDetail = AuthorSummary & {
  bio: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthorRecord = {
  id: number;
  name: string;
  slug: string;
  designation: string | null;
  profileImageUrl: string | null;
  bio: string | null;
  facebookUrl: string | null;
  twitterUrl: string | null;
  linkedinUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};
