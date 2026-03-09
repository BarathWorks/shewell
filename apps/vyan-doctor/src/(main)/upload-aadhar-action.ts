'use server';

import { db } from '~/server/db';
import { getServerSession } from 'next-auth';
import { ObjectCannedACL, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { revalidatePath } from 'next/cache';
import { DocumentType } from '@repo/database';
const getUploadPresignedUrl = async (key: string, isPublic: boolean, contentType: string = 'application/octet-stream') => {
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
  };
  const command = new PutObjectCommand(fileParams);
  return await getSignedUrl(s3, command, { expiresIn: 10 * 60 });
};

const uploadAadharAction = async (professionalUserId : string,fileKey: string,fileName: string, mimeType: string ,  type : DocumentType) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }
  // const key = `media/${new Date().getTime()}-${fileName}`;
  const key = fileKey;
  const fileUrl = await getFileUrlFromKey(key);

  await db.document.deleteMany({
    where : {
        professionalUserId : professionalUserId,
        type : type
    }
  })
  const document = await db.document.create({
    data: {
      fileKey: key,
      // fileUrl,
      // comments,
      mimeType,
      professionalUserId : professionalUserId,
      type : type
    }
  });
  const url = await getUploadPresignedUrl(key, false, mimeType);
  revalidatePath("/auth/register/identity-documents")
  // revalidatePath('/admin/media');

  return {
    id: document.id,
    key,
    fileUrl,
    presignedUrl: url,
    
  };
};

export const getFileUrlFromKey = (key: string) => {
  return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

export const deleteDocumentFromKey = async (professionalUserId : string, key: string, documentId : string) => {
  const session = await getServerSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
  }
  await db.document.delete({
    where : {
      id: documentId,
      professionalUserId : professionalUserId
    }
  })
  revalidatePath("auth/register/identity-documents")
  if (!key) {
    return;
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
    Key: key
  };
  return s3.deleteObject(fileParams);
};

export const DocumentErrorThenUploadFailed = async (documentId: string) => {
  // const session = await getServerSession();

  // if (!session) {
  //   return {
  //     error: 'Unauthorized'
  //   };
  // }

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

  const document = await db.document.findFirst({
    where: {
      id: documentId
    }
  });

  if (!document) {
    return;
  }

  const fileParams = {
    Bucket: process.env.AWS_BUCKET,
    Key: document.fileKey
  };

  try {
    await s3.getObject(fileParams);
  } catch (e) {
    await db.media.delete({
      where: {
        id: documentId
      }
    });
  }
};

export default uploadAadharAction;
