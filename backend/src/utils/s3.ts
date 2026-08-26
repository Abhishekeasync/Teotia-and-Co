import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { awsConfig } from '../config/aws';
import { HTTP_STATUS, UPLOAD_ALLOWED_MIME, UPLOAD_MAX_BYTES } from '../constants';
import { ApiError } from './ApiError';

const MIME_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * S3 key prefixes — these act as "folders" in the bucket.
 * In production one bucket (teotia-and-co-blog) is used for all uploads:
 *   blogs/   → featured images, OG images
 *   avatars/ → admin profile pictures (reserved for future use)
 */
export const S3_PREFIX = {
  blogs: 'blogs',
  avatars: 'avatars',
  resumes: 'resumes',
} as const;

export function assertImageUpload(file: Express.Multer.File | undefined): Express.Multer.File {
  if (!file || !file.buffer?.length) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Image file is required');
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'File too large');
  }
  const mime = file.mimetype.toLowerCase();
  if (!UPLOAD_ALLOWED_MIME.includes(mime as (typeof UPLOAD_ALLOWED_MIME)[number])) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid file type. Accepted formats: JPEG, PNG, WebP.');
  }
  return file;
}

function requireS3(): { client: S3Client; bucket: string; region: string } {
  if (!awsConfig.isConfigured) {
    throw new ApiError(HTTP_STATUS.SERVICE_UNAVAILABLE, 'File storage is not configured');
  }
  const { accessKeyId, secretAccessKey, region, bucket } = awsConfig.credentials;
  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });
  return { client, bucket, region };
}

export function buildPublicObjectUrl(bucket: string, region: string, key: string): string {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

export function extractObjectKeyFromUrl(url: string, bucket: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.startsWith(`${bucket}.`)) {
      return null;
    }
    const key = parsed.pathname.replace(/^\/+/, '');
    return key.length > 0 ? key : null;
  } catch {
    return null;
  }
}

export async function uploadBlogImage(file: Express.Multer.File): Promise<string> {
  const valid = assertImageUpload(file);
  const { client, bucket, region } = requireS3();
  const ext = MIME_EXTENSION[valid.mimetype.toLowerCase()] ?? 'bin';
  const key = `${S3_PREFIX.blogs}/${randomUUID()}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: valid.buffer,
      ContentType: valid.mimetype,
    }),
  );

  return buildPublicObjectUrl(bucket, region, key);
}

export async function uploadAvatarImage(file: Express.Multer.File): Promise<string> {
  const valid = assertImageUpload(file);
  const { client, bucket, region } = requireS3();
  const ext = MIME_EXTENSION[valid.mimetype.toLowerCase()] ?? 'bin';
  const key = `${S3_PREFIX.avatars}/${randomUUID()}.${ext}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: valid.buffer,
      ContentType: valid.mimetype,
    }),
  );

  return buildPublicObjectUrl(bucket, region, key);
}

/** Deletes S3 object when URL points at our bucket; ignores external or local paths. */
export async function deleteBlogImageByUrl(url: string | null | undefined): Promise<void> {
  if (!url || !awsConfig.isConfigured) {
    return;
  }
  const { bucket } = awsConfig.credentials;
  const key = extractObjectKeyFromUrl(url, bucket);
  if (!key) {
    return;
  }
  const { client } = requireS3();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

const RESUME_MIN_BYTES = 10 * 1024;
const RESUME_MAX_BYTES = 5 * 1024 * 1024;

export function assertResumeUpload(file: Express.Multer.File | undefined): Express.Multer.File {
  if (!file || !file.buffer?.length) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Resume file is required');
  }
  if (file.size < RESUME_MIN_BYTES) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Resume file is too small. Minimum size is 10KB.');
  }
  if (file.size > RESUME_MAX_BYTES) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Resume file too large. Max 5MB allowed.');
  }
  const mime = file.mimetype.toLowerCase();
  const name = (file.originalname || '').toLowerCase();
  const hasPdfExtension = name.endsWith('.pdf');
  if (mime !== 'application/pdf' && !hasPdfExtension) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid file type. Only PDF is accepted.');
  }
  const signature = file.buffer.subarray(0, 4).toString('latin1');
  if (signature !== '%PDF') {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid resume file. Please upload a valid PDF.');
  }
  return file;
}

export async function uploadResume(file: Express.Multer.File): Promise<string> {
  const valid = assertResumeUpload(file);
  const { client, bucket } = requireS3();
  const key = `${S3_PREFIX.resumes}/${randomUUID()}.pdf`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: valid.buffer,
      ContentType: valid.mimetype,
    }),
  );

  return key; // return the S3 key, not the public URL
}

function safeResumeFilename(filename: string | undefined): string {
  const base = (filename ?? 'resume').replace(/[/\\?%*:|"<>]/g, '').trim() || 'resume';
  return base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`;
}

export async function getPresignedResumeUrl(
  key: string,
  options?: { download?: boolean; filename?: string },
): Promise<string> {
  const { client, bucket } = requireS3();
  const filename = safeResumeFilename(options?.filename);
  const disposition = `${options?.download ? 'attachment' : 'inline'}; filename="${filename}"`;
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
    ResponseContentType: 'application/pdf',
    ResponseContentDisposition: disposition,
  });
  // URL expires in 15 minutes
  return getSignedUrl(client, command, { expiresIn: 15 * 60 });
}
