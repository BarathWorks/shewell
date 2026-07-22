'use server';

import { db } from '~/server/db';
import { getServerSession } from 'next-auth';
import { GetObjectCommand, ObjectCannedACL, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { revalidatePath } from 'next/cache';
import { env } from '~/env';

const getS3Client = () => {
  return new S3({
    region: env.AWS_REGION || process.env.S3_UPLOAD_REGION || "ap-south-1",
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID || process.env.S3_UPLOAD_KEY!,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || process.env.S3_UPLOAD_SECRET!,
    },
  });
};

const getUploadPresignedUrl = async (key: string, isPublic: boolean, contentType: string = 'application/octet-stream') => {
  const bucket = env.AWS_BUCKET || process.env.S3_UPLOAD_BUCKET;
  const fileParams = {
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  };
  const command = new PutObjectCommand(fileParams);
  return await getSignedUrl(getS3Client(), command, { expiresIn: 10 * 60 });
};

export const getDownloadPresignedUrl = async (key: string, expiresInSeconds: number = 3600) => {
  if (!key) return null;
  const bucket = env.AWS_BUCKET || process.env.S3_UPLOAD_BUCKET;
  if (!bucket) {
    console.error("Missing AWS_BUCKET or S3_UPLOAD_BUCKET environment variable.");
    return null;
  }
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    return await getSignedUrl(getS3Client(), command, { expiresIn: expiresInSeconds });
  } catch (error) {
    console.error("Error generating presigned GET URL:", error);
    return null;
  }
};

const uploadProfessionalUserImage = async (professionalUserId : string,fileKey: string,fileName: string, mimeType: string, comments: string = '') => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }
  const key = fileKey;
  
  const fileUrl = await getFileUrlFromKey(key);
  try{

    const media = await db.media.create({
      data: {
        fileKey: key,
        fileUrl,
        comments,
        mimeType,
        professionalUser : {
          connect : {
            id : professionalUserId
          }
        }
      },
    });
    console.log("before uploading")
    const url = await getUploadPresignedUrl(key, true, mimeType);
    const presignedGetUrl = await getDownloadPresignedUrl(key);
    console.log("after uploading", url)
  
    return {
      id: media.id,
      key,
      fileUrl: presignedGetUrl || fileUrl,
      presignedUrl: url
    };
  }
  catch(e){
    console.log("Error while creating media",e)
    throw new Error("Error while creating media")
  }
};

export const getFileUrlFromKey = (key: string) => {
  return `https://${env.AWS_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
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

export default uploadProfessionalUserImage;
