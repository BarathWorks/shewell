'use server';

import { db } from '@/src/server/db';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { revalidatePath } from 'next/cache';
import { env } from '@/env';
import { requireAdminSession } from '@/src/server/authz';


/** Image types the media library accepts. Anything else is rejected outright. */
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif'
]);

/**
 * Builds a safe object key.
 *
 * The filename came straight from the browser and was interpolated into the key
 * unsanitised. Anything outside this character set is replaced, and the name is
 * capped, so a crafted filename cannot shape the key.
 */
const buildMediaKey = (prefix: string, fileName: string) => {
  const safeName = (fileName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
  return `${prefix}/${new Date().getTime()}-${safeName}`;
};

/**
 * An HTML or SVG file served inline from the bucket executes on the bucket's
 * origin, so the content type is checked here rather than trusted — the value is
 * also what gets baked into the presigned PUT.
 */
const assertUploadableImage = (mimeType: string) => {
  if (!ALLOWED_IMAGE_TYPES.has((mimeType || '').toLowerCase())) {
    return { error: `Unsupported file type: ${mimeType || 'unknown'}` };
  }
  return null;
};

const getUploadPresignedUrl = async (key: string, isPublic: boolean, contentType: string = 'application/octet-stream') => {
  
  if (!env.AWS_BUCKET) {
    console.error('Missing AWS_BUCKET env var; cannot get presigned URL for', key);
    throw new Error('Missing AWS_BUCKET env var');
  }
  const s3 = new S3({
    // forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    // endpoint: process.env.S3_SPACES_URL!,
    region: process.env.AWS_REGION!,
    // region: process.env.S3_UPLOAD_REGION! || "blr1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });
  const fileParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    ContentType: contentType,
    // Expires: addSeconds(new Date(), 600),
    // ACL removed - using Bucket Policy instead for best practice
  };
  const command = new PutObjectCommand(fileParams);
  return await getSignedUrl(s3, command, { expiresIn: 10 * 60 });
};

const uploadProductImage = async (fileName: string, mimeType: string, comments: string = '',) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }
  const rejected = assertUploadableImage(mimeType);
  if (rejected) return rejected;

  const key = buildMediaKey('media', fileName);
  const fileUrl = await getFileUrlFromKey(key);
  try {
    const media = await db.media.create({
      data: {
        fileKey: key,
        fileUrl,
        comments,
        mimeType
      }
    });
    const url = await getUploadPresignedUrl(key, true, mimeType);

    revalidatePath('/admin/media');

    return {
      id: media.id,
      key,
      fileUrl,
      presignedUrl: url
    };
  }
  catch (e) {
    console.log("error while uploading blog", e);
    throw new Error("Error while uploading blog")
  }
};

export const getPresignedMediaImageUrl = async (fileName: string, mimeType: string = 'application/octet-stream') => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }
  const rejected = assertUploadableImage(mimeType);
  if (rejected) return rejected;

  const key = buildMediaKey('homePageBanner', fileName);

  const url = await getUploadPresignedUrl(key, true, mimeType);
  const imageUrl = await getFileUrlFromKey(key);

  return {
    key: key,
    imageUrl: imageUrl,
    presignedUrl: url
  };
};

export const getFileUrlFromKey = (key: string) => {
  if (!env.AWS_BUCKET) {
    console.error('Missing AWS_BUCKET env var; cannot construct file URL for', key);
    throw new Error('Missing AWS_BUCKET env var');
  }

  const host = env.AWS_REGION
    ? `${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`
    : `${env.AWS_BUCKET}.s3.amazonaws.com`;

  return `https://${host}/${key}`;
};

export const deleteImageFromKey = async (key: string) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  if (!key) {
    return;
  }

  // The key is resolved from our own Media rows rather than trusted from the
  // caller. Accepting an arbitrary key let any content editor delete any object in
  // the bucket — which also holds practitioner Aadhaar and PAN scans under
  // `professionalUser/`.
  const media = await db.media.findFirst({
    where: { fileKey: key },
    select: { fileKey: true }
  });

  if (!media) {
    return {
      error: 'Not found'
    };
  }

  const s3 = new S3({
    region: env.AWS_REGION!,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY!
    }
  });

  const fileParams = {
    Bucket: env.AWS_BUCKET,
    Key: media.fileKey
  };

  return s3.deleteObject(fileParams);
};

export const mediaErrorThenUploadFailed = async (mediaId: string) => {
  const session = await requireAdminSession('content:write');

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  const s3 = new S3({
    // forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    // endpoint: process.env.S3_SPACES_URL!,
    region: env.AWS_REGION!,
    // region: process.env.S3_UPLOAD_REGION! || "blr1",
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY!
    }
  });

  const media = await db.media.findFirst({
    where: {
      id: mediaId
    }
  });

  if (!media) {
    return;
  }

  const fileParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: media.fileKey
  };

  try {
    await s3.getObject(fileParams);
  } catch (e) {
    await db.media.delete({
      where: {
        id: mediaId
      }
    });
  }
};

export default uploadProductImage;
