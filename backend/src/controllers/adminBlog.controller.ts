import { Request, Response } from 'express';
import { CreateBlogInput, UpdateBlogInput, BlogService } from '../services/blog.service';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePaginationQuery } from '../utils/pagination';
import {
  collectUploadedImages,
  pickUploadedFile,
} from '../middlewares/upload.middleware';
import { MAX_BLOG_IMAGES, HTTP_STATUS } from '../constants';
import { ApiError } from '../utils/ApiError';

const blogService = new BlogService();

function filesMap(
  files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined,
): { [fieldname: string]: Express.Multer.File[] } {
  if (!files || Array.isArray(files)) {
    return {};
  }
  return files;
}

/** Upload optional multipart files and merge resulting S3 URLs into the body. */
async function applyUploadedImages(req: Request, body: CreateBlogInput | UpdateBlogInput) {
  const map = filesMap(req.files);
  const featuredFile = pickUploadedFile(req.files, 'featuredImage');
  const loneImage = pickUploadedFile(req.files, 'image');
  const ogFile = pickUploadedFile(req.files, 'ogImage');
  const galleryFiles = map.images ?? [];

  if (featuredFile) {
    const { url } = await blogService.uploadImage(featuredFile);
    body.featuredImageUrl = url;
  } else if (loneImage && galleryFiles.length === 0) {
    const { url } = await blogService.uploadImage(loneImage);
    body.featuredImageUrl = url;
  }

  if (galleryFiles.length > 0) {
    if (galleryFiles.length > MAX_BLOG_IMAGES) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        `A blog can have at most ${MAX_BLOG_IMAGES} gallery images`,
      );
    }
    const { urls } = await blogService.uploadImages(galleryFiles);
    body.imageUrls = urls;
    if (!body.featuredImageUrl && urls[0]) {
      body.featuredImageUrl = urls[0];
    }
  }

  if (ogFile) {
    const { url } = await blogService.uploadImage(ogFile);
    body.ogImageUrl = url;
  }
}

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  const admin = req.admin!;
  const body = { ...(req.body as CreateBlogInput) };
  await applyUploadedImages(req, body);
  const blog = await blogService.createDraft(admin.id, admin.name, body);
  return ApiResponse.success(res, { blog }, 'Blog created', 201);
});

export const listAdminBlogs = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePaginationQuery(req.query);
  const result = await blogService.listAdmin(pagination);
  return ApiResponse.success(res, result, '');
});

export const getAdminBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const blog = await blogService.getAdminById(Number(id));
  return ApiResponse.success(res, { blog }, '');
});

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const body = { ...(req.body as UpdateBlogInput) };
  await applyUploadedImages(req, body);
  const blog = await blogService.updateBlog(Number(id), body);
  return ApiResponse.success(res, { blog }, 'Blog updated');
});

export const deleteBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  await blogService.deleteBlog(Number(id));
  return ApiResponse.success(res, {}, 'Blog deleted');
});

export const publishBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const blog = await blogService.publish(Number(id));
  return ApiResponse.success(res, { blog }, 'Blog published');
});

export const unpublishBlog = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const blog = await blogService.unpublish(Number(id));
  return ApiResponse.success(res, { blog }, 'Blog unpublished');
});

export const uploadBlogImage = asyncHandler(async (req: Request, res: Response) => {
  const files = collectUploadedImages(req.files);
  const { urls } = await blogService.uploadImages(files);
  return ApiResponse.success(
    res,
    { urls, url: urls[0] ?? null },
    urls.length === 1 ? 'Image uploaded' : 'Images uploaded',
    201,
  );
});

export const addBlogImages = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const files = collectUploadedImages(req.files);
  const blog = await blogService.addGalleryImages(Number(id), files);
  return ApiResponse.success(res, { blog }, 'Images added', 201);
});

export const deleteAllBlogImages = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const blog = await blogService.deleteAllGalleryImages(Number(id));
  return ApiResponse.success(res, { blog }, 'All gallery images deleted');
});

export const deleteBlogImage = asyncHandler(async (req: Request, res: Response) => {
  const { id, imageId } = req.params as { id: string; imageId: string };
  const blog = await blogService.deleteGalleryImage(Number(id), Number(imageId));
  return ApiResponse.success(res, { blog }, 'Image deleted');
});

export const replaceBlogImage = asyncHandler(async (req: Request, res: Response) => {
  const { id, imageId } = req.params as { id: string; imageId: string };
  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Image file is required (field name: image)');
  }
  const blog = await blogService.replaceGalleryImage(Number(id), Number(imageId), req.file);
  return ApiResponse.success(res, { blog }, 'Image updated');
});
