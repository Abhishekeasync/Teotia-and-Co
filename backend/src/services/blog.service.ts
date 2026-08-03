import { env } from '../config/env';
import { HTTP_STATUS, MAX_BLOG_IMAGES } from '../constants';
import {
  AdminBlogDetail,
  BlogImageItem,
  BlogRecord,
  BlogShareLinks,
  PublicBlogDetail,
  PublicBlogListFilters,
  PublicBlogSummary,
} from '../interfaces/blog.interface';
import { BlogRepository, CreateBlogRow, UpdateBlogRow } from '../repositories/blog.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { TagRepository } from '../repositories/tag.repository';
import { AuthorRepository } from '../repositories/author.repository';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { notifySubscribersOfNewPost } from '../utils/mail';
import { buildPaginationMeta, PaginationParams } from '../utils/pagination';
import { deleteBlogImageByUrl, uploadBlogImage } from '../utils/s3';
import { slugify, uniqueSlugFromHeading } from '../utils/slug';

export type CreateBlogInput = {
  heading: string;
  shortDescription: string;
  body: string;
  categoryId: number;
  tagNames?: string[];
  authorName?: string;
  authorIds?: number[];
  featuredImageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  ogImageUrl?: string | null;
  /** Gallery image URLs (max MAX_BLOG_IMAGES). */
  imageUrls?: string[];
  publishType?: 'draft' | 'publish_now' | 'scheduled';
  scheduledPublishAt?: Date | null;
};

export type UpdateBlogInput = Partial<CreateBlogInput>;

export class BlogService {
  constructor(
    private readonly blogRepository = new BlogRepository(),
    private readonly categoryRepository = new CategoryRepository(),
    private readonly tagRepository = new TagRepository(),
    private readonly authorRepository = new AuthorRepository(),
  ) {}

  private async resolveCategory(categoryId: number) {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid category');
    }
    return category;
  }

  private formatAuthorDisplayName(names: string[]): string {
    return names.join(', ');
  }

  private async resolveAuthorDisplayName(authorIds: number[]): Promise<string> {
    const names: string[] = [];
    for (const authorId of authorIds) {
      const author = await this.authorRepository.findById(authorId);
      if (!author) {
        throw new ApiError(HTTP_STATUS.BAD_REQUEST, `Invalid author id: ${authorId}`);
      }
      names.push(author.name);
    }
    return this.formatAuthorDisplayName(names);
  }

  private async toPublicSummary(blogId: number, record: BlogRecord): Promise<PublicBlogSummary> {
    const category = await this.categoryRepository.findById(record.categoryId);
    if (!category) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Blog category missing');
    }
    const tags = await this.tagRepository.listNamesByBlogId(blogId);
    const authors = await this.authorRepository.findByBlogId(blogId);
    const authorName =
      authors.length > 0
        ? this.formatAuthorDisplayName(authors.map((author) => author.name))
        : record.authorName;
    return {
      slug: record.slug,
      heading: record.heading,
      shortDescription: record.shortDescription,
      featuredImageUrl: record.featuredImageUrl,
      authorName,
      authors,
      publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
      category,
      tags,
    };
  }

  private async toPublicDetail(record: BlogRecord): Promise<PublicBlogDetail> {
    const summary = await this.toPublicSummary(record.id, record);
    const images = await this.blogRepository.listImageUrls(record.id);
    return {
      ...summary,
      body: record.body,
      metaTitle: record.metaTitle,
      metaDescription: record.metaDescription,
      canonicalUrl: record.canonicalUrl,
      ogImageUrl: record.ogImageUrl,
      images,
    };
  }

  private assertImageLimit(urls: string[]): string[] {
    if (urls.length > MAX_BLOG_IMAGES) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `A blog can have at most ${MAX_BLOG_IMAGES} gallery images`,
      );
    }
    return urls.slice(0, MAX_BLOG_IMAGES);
  }

  private async toAdminDetail(record: BlogRecord): Promise<AdminBlogDetail> {
    const summary = await this.toPublicSummary(record.id, record);
    const images = await this.blogRepository.listImages(record.id);
    return {
      ...summary,
      body: record.body,
      metaTitle: record.metaTitle,
      metaDescription: record.metaDescription,
      canonicalUrl: record.canonicalUrl,
      ogImageUrl: record.ogImageUrl,
      images,
      id: record.id,
      status: record.status,
      publishType: record.publishType,
      scheduledPublishAt: record.scheduledPublishAt ? record.scheduledPublishAt.toISOString() : null,
      schedulerStatus: record.schedulerStatus,
      categoryId: record.categoryId,
      viewCount: record.viewCount,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  private async allocateSlug(heading: string, excludeId?: number): Promise<string> {
    const base = slugify(heading);
    if (!base) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Heading must produce a valid slug');
    }
    return uniqueSlugFromHeading(heading, async (slug) => {
      const taken = await this.blogRepository.slugTaken(slug, excludeId);
      return !taken;
    });
  }

  async createDraft(adminId: number, adminName: string, input: CreateBlogInput): Promise<AdminBlogDetail> {
    await this.resolveCategory(input.categoryId);

    if (await this.blogRepository.headingTaken(input.heading)) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'A blog with this heading already exists');
    }

    const slug = await this.allocateSlug(input.heading);
    let authorName = input.authorName?.trim() || adminName;
    if (input.authorIds && input.authorIds.length > 0) {
      authorName = await this.resolveAuthorDisplayName(input.authorIds);
    }
    const row: CreateBlogRow = {
      heading: input.heading.trim(),
      slug,
      shortDescription: input.shortDescription.trim(),
      body: input.body,
      categoryId: input.categoryId,
      authorName,
      createdByAdminId: adminId,
      featuredImageUrl: input.featuredImageUrl ?? null,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
      canonicalUrl: input.canonicalUrl ?? null,
      ogImageUrl: input.ogImageUrl ?? null,
      status: input.publishType === 'publish_now' ? 'published' : 'draft',
      publishType: input.publishType ?? 'draft',
      scheduledPublishAt: input.scheduledPublishAt ?? null,
      schedulerStatus: input.publishType === 'scheduled' ? 'pending' : null,
      publishedAt: input.publishType === 'publish_now' ? new Date() : null,
    };

    const blogId = await this.blogRepository.create(row);
    const tagIds = await this.tagRepository.findOrCreateIds(input.tagNames ?? []);
    await this.tagRepository.replaceBlogTags(blogId, tagIds);
    if (input.authorIds && input.authorIds.length > 0) {
      await this.authorRepository.replaceBlogAuthors(blogId, input.authorIds);
    }

    if (input.imageUrls !== undefined) {
      const urls = this.assertImageLimit(input.imageUrls);
      await this.blogRepository.replaceImageUrls(blogId, urls);
      if (!row.featuredImageUrl && urls[0]) {
        await this.blogRepository.update(blogId, { featuredImageUrl: urls[0] });
      }
    }

    const created = await this.blogRepository.findById(blogId);
    if (!created) {
      throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to load created blog');
    }
    return this.toAdminDetail(created);
  }

  async updateBlog(id: number, input: UpdateBlogInput): Promise<AdminBlogDetail> {
    const existing = await this.blogRepository.findById(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }

    const patch: UpdateBlogRow = {};

    if (input.categoryId !== undefined) {
      await this.resolveCategory(input.categoryId);
      patch.categoryId = input.categoryId;
    }
    if (input.shortDescription !== undefined) patch.shortDescription = input.shortDescription.trim();
    if (input.body !== undefined) patch.body = input.body;
    if (input.authorName !== undefined && input.authorIds === undefined) {
      patch.authorName = input.authorName.trim();
    }
    if (input.metaTitle !== undefined) patch.metaTitle = input.metaTitle;
    if (input.metaDescription !== undefined) patch.metaDescription = input.metaDescription;
    if (input.canonicalUrl !== undefined) patch.canonicalUrl = input.canonicalUrl;
    if (input.ogImageUrl !== undefined) patch.ogImageUrl = input.ogImageUrl;

    if (input.publishType !== undefined) {
      patch.publishType = input.publishType;
      if (input.publishType === 'publish_now') {
        patch.status = 'published';
        patch.publishedAt = new Date();
        patch.schedulerStatus = null;
        patch.scheduledPublishAt = null;
      } else if (input.publishType === 'scheduled') {
        patch.status = 'draft';
        patch.schedulerStatus = 'pending';
        patch.scheduledPublishAt = input.scheduledPublishAt ?? null;
      } else {
        patch.status = 'draft';
        patch.schedulerStatus = null;
        patch.scheduledPublishAt = null;
      }
    } else if (input.scheduledPublishAt !== undefined) {
       patch.scheduledPublishAt = input.scheduledPublishAt;
    }

    if (input.heading !== undefined && input.heading.trim() !== existing.heading) {
      const heading = input.heading.trim();
      if (await this.blogRepository.headingTaken(heading, id)) {
        throw new ApiError(HTTP_STATUS.CONFLICT, 'A blog with this heading already exists');
      }
      patch.heading = heading;
      patch.slug = await this.allocateSlug(heading, id);
    }

    if (input.ogImageUrl !== undefined && input.ogImageUrl !== existing.ogImageUrl) {
      await deleteBlogImageByUrl(existing.ogImageUrl);
      patch.ogImageUrl = input.ogImageUrl;
    }

    if (input.featuredImageUrl !== undefined && input.featuredImageUrl !== existing.featuredImageUrl) {
      await deleteBlogImageByUrl(existing.featuredImageUrl);
      patch.featuredImageUrl = input.featuredImageUrl;
    }

    await this.blogRepository.update(id, patch);

    if (input.tagNames !== undefined) {
      const tagIds = await this.tagRepository.findOrCreateIds(input.tagNames);
      await this.tagRepository.replaceBlogTags(id, tagIds);
    }

    if (input.authorIds !== undefined) {
      const resolvedAuthorName =
        input.authorIds.length > 0
          ? await this.resolveAuthorDisplayName(input.authorIds)
          : undefined;
      await this.authorRepository.replaceBlogAuthors(id, input.authorIds);
      if (resolvedAuthorName !== undefined) {
        await this.blogRepository.update(id, { authorName: resolvedAuthorName });
      }
    }

    if (input.imageUrls !== undefined) {
      const previous = await this.blogRepository.listImageUrls(id);
      const urls = this.assertImageLimit(input.imageUrls);
      const removed = previous.filter((url) => !urls.includes(url));
      await Promise.all(removed.map((url) => deleteBlogImageByUrl(url)));
      await this.blogRepository.replaceImageUrls(id, urls);
    }

    const updated = await this.blogRepository.findById(id);
    if (!updated) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    return this.toAdminDetail(updated);
  }

  async deleteBlog(id: number): Promise<void> {
    const existing = await this.blogRepository.findById(id);
    if (!existing) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    const gallery = await this.blogRepository.listImageUrls(id);
    await this.blogRepository.softDelete(id);
    await Promise.all([
      deleteBlogImageByUrl(existing.featuredImageUrl),
      deleteBlogImageByUrl(existing.ogImageUrl),
      ...gallery.map((url) => deleteBlogImageByUrl(url)),
    ]);
  }

  async getAdminById(id: number): Promise<AdminBlogDetail> {
    const blog = await this.blogRepository.findById(id);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    return this.toAdminDetail(blog);
  }

  async listAdmin(pagination: PaginationParams) {
    const [items, total] = await Promise.all([
      this.blogRepository.listAdmin(pagination),
      this.blogRepository.countAdmin(),
    ]);
    const blogs = await Promise.all(items.map((row) => this.toAdminDetail(row)));
    return {
      blogs,
      pagination: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  async publish(id: number): Promise<AdminBlogDetail> {
    logger.info('[PUBLISH] Publish request received', { blogId: id });

    const blog = await this.blogRepository.findById(id);
    if (!blog) {
      logger.warn('[PUBLISH] Blog not found', { blogId: id });
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }

    const wasAlreadyPublished = blog.status === 'published';
    const publishedAt = blog.publishedAt ?? new Date();

    logger.info('[PUBLISH] Current blog state', {
      blogId: id,
      slug: blog.slug,
      currentStatus: blog.status,
      wasAlreadyPublished,
      publishedAt,
    });

    logger.info('[PUBLISH] Updating blog status to published', { blogId: id });
    await this.blogRepository.update(id, {
      status: 'published',
      publishedAt,
    });

    const refreshed = await this.blogRepository.findById(id);
    if (!refreshed) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    logger.info('[PUBLISH] Blog status updated successfully', { blogId: id, slug: refreshed.slug });

    // Send email notifications to subscribers (only for newly published posts)
    if (!wasAlreadyPublished) {
      logger.info('[PUBLISH] First-time publish detected \u2014 triggering subscriber notification pipeline', {
        blogId: id,
        slug: refreshed.slug,
        heading: refreshed.heading,
      });

      // Non-blocking: don't await, let it run in background
      notifySubscribersOfNewPost({
        heading: refreshed.heading,
        slug: refreshed.slug,
        shortDescription: refreshed.shortDescription,
        authorName: refreshed.authorName,
        featuredImageUrl: refreshed.featuredImageUrl,
      }).catch((error) => {
        logger.error('[PUBLISH] Uncaught error in background notification pipeline', { blogId: id, error });
      });

      logger.info('[PUBLISH] Background notification pipeline started (non-blocking)', { blogId: id });
    } else {
      logger.info('[PUBLISH] Blog was already published \u2014 skipping subscriber notifications (no duplicate emails)', {
        blogId: id,
        slug: refreshed.slug,
      });
    }

    return this.toAdminDetail(refreshed);
  }

  async unpublish(id: number): Promise<AdminBlogDetail> {
    const blog = await this.blogRepository.findById(id);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    await this.blogRepository.update(id, { status: 'draft' });
    const refreshed = await this.blogRepository.findById(id);
    if (!refreshed) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    return this.toAdminDetail(refreshed);
  }

  async uploadImage(file: Express.Multer.File): Promise<{ url: string }> {
    const url = await uploadBlogImage(file);
    return { url };
  }

  /** Upload up to MAX_BLOG_IMAGES files; returns public S3 URLs in order. */
  async uploadImages(files: Express.Multer.File[]): Promise<{ urls: string[] }> {
    if (files.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'At least one image file is required');
    }
    if (files.length > MAX_BLOG_IMAGES) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `You can upload at most ${MAX_BLOG_IMAGES} images at once`,
      );
    }
    const urls: string[] = [];
    for (const file of files) {
      urls.push(await uploadBlogImage(file));
    }
    return { urls };
  }

  async listGallery(blogId: number): Promise<BlogImageItem[]> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    return this.blogRepository.listImages(blogId);
  }

  /** Removes every gallery row for the blog and deletes S3 objects. */
  async deleteAllGalleryImages(blogId: number): Promise<AdminBlogDetail> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    const urls = await this.blogRepository.deleteAllImages(blogId);
    await Promise.all(urls.map((url) => deleteBlogImageByUrl(url)));
    return this.toAdminDetail(blog);
  }

  /** Deletes one gallery image by id (must belong to this blog). */
  async deleteGalleryImage(blogId: number, imageId: number): Promise<AdminBlogDetail> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    const image = await this.blogRepository.findImage(blogId, imageId);
    if (!image) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Image not found');
    }
    await this.blogRepository.deleteImage(imageId);
    await deleteBlogImageByUrl(image.url);
    return this.toAdminDetail(blog);
  }

  /** Replaces one gallery image file; old S3 object is deleted. */
  async replaceGalleryImage(
    blogId: number,
    imageId: number,
    file: Express.Multer.File,
  ): Promise<AdminBlogDetail> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    const image = await this.blogRepository.findImage(blogId, imageId);
    if (!image) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Image not found');
    }
    const { url } = await this.uploadImage(file);
    await this.blogRepository.updateImageUrl(imageId, url);
    await deleteBlogImageByUrl(image.url);
    const refreshed = await this.blogRepository.findById(blogId);
    if (!refreshed) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    return this.toAdminDetail(refreshed);
  }

  /** Appends gallery images without exceeding MAX_BLOG_IMAGES. */
  async addGalleryImages(blogId: number, files: Express.Multer.File[]): Promise<AdminBlogDetail> {
    const blog = await this.blogRepository.findById(blogId);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    if (files.length === 0) {
      throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'At least one image file is required');
    }

    const currentCount = await this.blogRepository.countImages(blogId);
    const remaining = MAX_BLOG_IMAGES - currentCount;
    if (remaining <= 0) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `A blog can have at most ${MAX_BLOG_IMAGES} gallery images`,
      );
    }
    if (files.length > remaining) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `Only ${remaining} more image(s) allowed (max ${MAX_BLOG_IMAGES})`,
      );
    }

    const { urls } = await this.uploadImages(files);
    let sortOrder = currentCount;
    for (const url of urls) {
      await this.blogRepository.appendImage(blogId, url, sortOrder);
      sortOrder += 1;
    }

    if (!blog.featuredImageUrl && urls[0]) {
      await this.blogRepository.update(blogId, { featuredImageUrl: urls[0] });
    }

    const refreshed = await this.blogRepository.findById(blogId);
    if (!refreshed) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    return this.toAdminDetail(refreshed);
  }

  async listPublic(filters: PublicBlogListFilters, pagination: PaginationParams) {
    const category = filters.categorySlug
      ? await this.categoryRepository.findBySlug(filters.categorySlug)
      : null;
    if (filters.categorySlug && !category) {
      return {
        blogs: [] as PublicBlogSummary[],
        pagination: buildPaginationMeta(0, pagination.page, pagination.limit),
      };
    }

    let tagId: number | undefined;
    if (filters.tagName?.trim()) {
      const found = await this.tagRepository.findIdByName(filters.tagName);
      if (found === null) {
        return {
          blogs: [] as PublicBlogSummary[],
          pagination: buildPaginationMeta(0, pagination.page, pagination.limit),
        };
      }
      tagId = found;
    }

    let authorId: number | undefined;
    if (filters.authorSlug?.trim()) {
      const author = await this.authorRepository.findBySlug(filters.authorSlug.trim());
      if (!author) {
        return {
          blogs: [] as PublicBlogSummary[],
          pagination: buildPaginationMeta(0, pagination.page, pagination.limit),
        };
      }
      authorId = author.id;
    }

    const [items, total] = await Promise.all([
      this.blogRepository.listPublic(
        filters,
        pagination,
        category?.id,
        tagId,
        authorId,
      ),
      this.blogRepository.countPublic(filters, category?.id, tagId, authorId),
    ]);

    const blogs = await Promise.all(items.map((row) => this.toPublicSummary(row.id, row)));
    return {
      blogs,
      pagination: buildPaginationMeta(total, pagination.page, pagination.limit),
    };
  }

  async getPublicBySlug(slug: string): Promise<PublicBlogDetail> {
    const blog = await this.blogRepository.findPublishedBySlug(slug);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    await this.blogRepository.incrementViewCount(blog.id);
    return this.toPublicDetail(blog);
  }

  async getShareLinks(slug: string): Promise<BlogShareLinks> {
    const blog = await this.blogRepository.findPublishedBySlug(slug);
    if (!blog) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog not found');
    }
    const pageUrl = `${env.BASE_URL.replace(/\/+$/, '')}/blog/${blog.slug}`;
    const encodedUrl = encodeURIComponent(pageUrl);
    const encodedText = encodeURIComponent(`${blog.heading} — ${pageUrl}`);
    return {
      slug: blog.slug,
      pageUrl,
      linkedIn: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsApp: `https://wa.me/?text=${encodedText}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(blog.heading)}`,
    };
  }
}
