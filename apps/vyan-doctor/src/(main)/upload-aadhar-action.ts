'use server';

import { db } from '~/server/db';
import { getServerAuthSession } from '~/server/auth';
import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { revalidatePath } from 'next/cache';
import { DocumentType } from '@repo/database';

const s3Client = () =>
  new S3({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  });

const getUploadPresignedUrl = async (key: string, contentType: string = 'application/octet-stream') => {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET,
    Key: key,
    ContentType: contentType
  });
  return await getSignedUrl(s3Client(), command, { expiresIn: 10 * 60 });
};

/**
 * Builds the S3 key from the authenticated practitioner's id. The key is never taken
 * from the caller: an attacker-supplied key let any logged-in user mint a presigned
 * PUT for an arbitrary object in the bucket.
 */
const buildDocumentKey = (professionalUserId: string, fileName: string) => {
  const safeName = (fileName || 'file').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100);
  return `professionalUser/${professionalUserId}/documents/${new Date().getTime()}-${safeName}`;
};

const uploadAadharAction = async (
  _professionalUserId: string,
  _fileKey: string,
  fileName: string,
  mimeType: string,
  type: DocumentType
) => {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    };
  }

  // `_professionalUserId` and `_fileKey` are accepted for signature compatibility but
  // deliberately ignored — both were caller-controlled and are now derived from the session.
  const professionalUserId = session.user.id;
  const key = buildDocumentKey(professionalUserId, fileName);
  const fileUrl = getFileUrlFromKey(key);

  await db.document.deleteMany({
    where: {
      professionalUserId: professionalUserId,
      type: type
    }
  });

  const document = await db.document.create({
    data: {
      fileKey: key,
      mimeType,
      professionalUserId: professionalUserId,
      type: type
    }
  });
  const url = await getUploadPresignedUrl(key, mimeType);
  revalidatePath('/auth/register/identity-documents');

  return {
    id: document.id,
    key,
    fileUrl,
    presignedUrl: url
  };
};

export const getFileUrlFromKey = (key: string) => {
  return `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

export const deleteDocumentFromKey = async (_professionalUserId: string, _key: string, documentId: string) => {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    };
  }
  const professionalUserId = session.user.id;

  // Resolve the key from our own records instead of trusting the caller, so a crafted
  // key cannot delete an arbitrary object from the bucket.
  const document = await db.document.findFirst({
    where: {
      id: documentId,
      professionalUserId: professionalUserId
    }
  });

  if (!document) {
    return {
      error: 'Not found'
    };
  }

  await db.document.delete({
    where: {
      id: document.id
    }
  });
  revalidatePath('/auth/register/identity-documents');

  if (!document.fileKey) {
    return;
  }

  return s3Client().deleteObject({
    Bucket: process.env.AWS_BUCKET,
    Key: document.fileKey
  });
};

export const DocumentErrorThenUploadFailed = async (documentId: string) => {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    };
  }

  const document = await db.document.findFirst({
    where: {
      id: documentId,
      professionalUserId: session.user.id
    }
  });

  if (!document) {
    return;
  }

  try {
    await s3Client().getObject({
      Bucket: process.env.AWS_BUCKET,
      Key: document.fileKey
    });
  } catch (e) {
    // The upload never landed in S3, so drop the orphaned Document row.
    await db.document.delete({
      where: {
        id: document.id
      }
    });
  }
};

export default uploadAadharAction;
