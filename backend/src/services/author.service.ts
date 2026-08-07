import { HTTP_STATUS } from '../constants';
import { AuthorDetail } from '../interfaces/author.interface';
import { AuthorRepository, CreateAuthorRow, UpdateAuthorRow } from '../repositories/author.repository';
import { ApiError } from '../utils/ApiError';
import { buildPaginationMeta, PaginationParams } from '../utils/pagination';
import { deleteBlogImageByUrl, uploadAvatarImage } from '../utils/s3';
import { slugify, uniqueSlugFromHeading } from '../utils/slug';

export type CreateAuthorInput = {
  name: string;
  designation?: string | null;
  bio?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
};

export type UpdateAuthorInput = Partial<CreateAuthorInput> & {
  removeProfileImage?: boolean;
  profileImageUrl?: string | null;
};

export class AuthorService {
  constructor(private readonly authorRepository = new AuthorRepository()) {}

  private async allocateSlug(name: string, excludeId?: number): Promise<string> {
    const base = slugify(name);
    if (!base) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Name must produce a valid slug');
    }
    return uniqueSlugFromHeading(name, async (slug) => {
      const taken = await this.authorRepository.slugTaken(slug, excludeId);
      return !taken;
    });
  }

  async createAuthor(input: CreateAuthorInput, file?: Express.Multer.File): Promise<AuthorDetail> {
    const slug = await this.allocateSlug(input.name);
    
    let profileImageUrl: string | null = null;
    if (file) {
      profileImageUrl = await uploadAvatarImage(file);
    }

    const row: CreateAuthorRow = {
      name: input.name.trim(),
      slug,
      designation: input.designation?.trim() || null,
      bio: input.bio?.trim() || null,
      facebookUrl: input.facebookUrl?.trim(),
      twitterUrl: input.twitterUrl?.trim(),
      linkedinUrl: input.linkedinUrl?.trim(),
      profileImageUrl,
    };

    const id = await this.authorRepository.create(row);
    const created = await this.authorRepository.findById(id);
    if (!created) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to load created author');
    }
    return this.toDetail(created);
  }

  async updateAuthor(id: number, input: UpdateAuthorInput, file?: Express.Multer.File): Promise<AuthorDetail> {
    const existing = await this.authorRepository.findById(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Author not found');
    }

    const patch: UpdateAuthorRow = {};
    if (input.name !== undefined && input.name.trim() !== existing.name) {
      patch.name = input.name.trim();
      patch.slug = await this.allocateSlug(patch.name, id);
    }
    if (input.designation !== undefined) patch.designation = input.designation?.trim() || null;
    if (input.bio !== undefined) patch.bio = input.bio?.trim() || null;
    if (input.facebookUrl !== undefined) patch.facebookUrl = input.facebookUrl?.trim() || null;
    if (input.twitterUrl !== undefined) patch.twitterUrl = input.twitterUrl?.trim() || null;
    if (input.linkedinUrl !== undefined) patch.linkedinUrl = input.linkedinUrl?.trim() || null;

    if (file) {
      const newUrl = await uploadAvatarImage(file);
      if (existing.profileImageUrl) {
        await deleteBlogImageByUrl(existing.profileImageUrl);
      }
      patch.profileImageUrl = newUrl;
    } else if (input.removeProfileImage || input.profileImageUrl === null) {
      if (existing.profileImageUrl) {
        await deleteBlogImageByUrl(existing.profileImageUrl);
      }
      patch.profileImageUrl = null;
    }

    await this.authorRepository.update(id, patch);

    const updated = await this.authorRepository.findById(id);
    if (!updated) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Author not found');
    }
    return this.toDetail(updated);
  }

  async deleteAuthor(id: number): Promise<void> {
    const existing = await this.authorRepository.findById(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Author not found');
    }
    await this.authorRepository.softDelete(id);
    if (existing.profileImageUrl) {
      await deleteBlogImageByUrl(existing.profileImageUrl);
    }
  }

  async getAdminById(id: number): Promise<AuthorDetail> {
    const author = await this.authorRepository.findById(id);
    if (!author) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Author not found');
    }
    return this.toDetail(author);
  }

  async getPublicBySlug(slug: string): Promise<AuthorDetail> {
    const author = await this.authorRepository.findBySlug(slug);
    if (!author) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Author not found');
    }
    return this.toDetail(author);
  }

  async listAdmin(pagination: PaginationParams) {
    const [items, total] = await Promise.all([
      this.authorRepository.listAdmin(pagination),
      this.authorRepository.countAdmin(),
    ]);
    const authors = items.map((row) => this.toDetail(row));
    return {
      authors,
      pagination: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  private toDetail(record: any): AuthorDetail {
    return {
      id: record.id,
      name: record.name,
      slug: record.slug,
      designation: record.designation,
      profileImageUrl: record.profileImageUrl,
      bio: record.bio,
      facebookUrl: record.facebookUrl,
      twitterUrl: record.twitterUrl,
      linkedinUrl: record.linkedinUrl,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
