'use server';

import { db } from '~/server/db';
import { getServerAuthSession } from '~/server/auth';
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


/**
 * Built from the authenticated practitioner's id — never from the caller, which
 * previously allowed minting a presigned PUT for any object in the bucket.
 */
const buildOwnedKey = (professionalUserId: string, prefix: string, fileName: string) => {
  const safeName = (fileName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
  return `professionalUser/${professionalUserId}/${prefix}/${new Date().getTime()}-${safeName}`;
};

const uploadPanAction = async (_professionalUserId : string,_fileKey: string,fileName: string, mimeType: string ,  type : DocumentType) => {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    };
  }
  const professionalUserId = session.user.id;
  const key = buildOwnedKey(professionalUserId, 'documents', fileName);
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
  const session = await getServerAuthSession();

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
  const session = await getServerAuthSession();

  if (!session) {
    return {
      error: 'Unauthorized'
    };
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

export default uploadPanAction;
