'use server';

import { db } from '@/src/server/db';
import { getServerSession } from 'next-auth';
import { ObjectCannedACL, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { revalidatePath } from 'next/cache';
import { env } from '@/env';

const getUploadPresignedUrl = async (key: string, isPublic: boolean) => {
  console.log('env in upload blog image action', env);
  const s3 = new S3({
    // forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    // endpoint: process.env.S3_SPACES_URL!,
    region: env.AWS_REGION ?? 'us-east-1',
    // region: process.env.S3_UPLOAD_REGION! || "blr1",
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY!
    }
  });
  const fileParams = {
    Bucket: env.AWS_BUCKET,
    Key: key,
    ContentType: 'text',
    // Expires: addSeconds(new Date(), 600),
    ACL: isPublic ? ObjectCannedACL.public_read : ObjectCannedACL.private
  };
  const command = new PutObjectCommand(fileParams);
  return await getSignedUrl(s3, command, { expiresIn: 10 * 60 });
};

const uploadBlogImage = async (blogId: string, fileKey: string, fileName: string, mimeType: string, comments: string = '') => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }
  // const key = `media/${new Date().getTime()}-${fileName}`;
  const key = fileKey;

  const fileUrl = await getFileUrlFromKey(key);
  try {
    console.log('blogId while creating blog', blogId);

    const media = await db.media.create({
      data: {
        fileKey: key,
        fileUrl,
        comments,
        mimeType,
        blogs: {
          connect: {
            id: blogId
          }
        }
        // professionalUser : {
        //   connect : {
        //     id : professionalUserId
        //   }
        // }
      }
      //  where : {
      //   // id : mediaId,
      //   professionalUser : {
      //     id : professionalUserId
      //   }
      //  }
    });
    console.log('before uploading');
    const url = await getUploadPresignedUrl(key, true);
    console.log('after uploading', url);
    // revalidatePath("/auth/register/uploads")
    // revalidatePath('/admin/media');

    return {
      id: media.id,
      key,
      fileUrl,
      presignedUrl: url
    };
  } catch (e) {
    console.log('Error while creating media', e);
    throw new Error('Error while creating media');
  }
};

export const getFileUrlFromKey = (key: string) => {
  if (!env.AWS_BUCKET) {
    console.error('Missing AWS_BUCKET env var; cannot construct file URL for', key);
    throw new Error('Missing AWS_BUCKET env var');
  }

  const host = env.AWS_REGION ? `${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com` : `${env.AWS_BUCKET}.s3.amazonaws.com`;

  return `https://${host}/${key}`;
};

export const deleteImageFromKey = async (key: string) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }

  if (!key) {
    return;
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

  const fileParams = {
    Bucket: env.AWS_BUCKET,
    Key: key
  };
  return s3.deleteObject(fileParams);
};

export const mediaErrorThenUploadFailed = async (mediaId: string) => {
  const session = await getServerSession();

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
    Bucket: env.AWS_BUCKET,
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

export default uploadBlogImage;
