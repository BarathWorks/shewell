'use server';

import { db } from '~/server/db';
import { getServerAuthSession } from '~/server/auth';
import { ObjectCannedACL, PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { revalidatePath } from 'next/cache';
import { env } from '~/env';

const getUploadPresignedUrl = async (key: string, isPublic: boolean, contentType: string = 'application/octet-stream') => {
  const s3 = new S3({
    // forcePathStyle: false, // Configures to use subdomain/virtual calling format.
    // endpoint: process.env.S3_SPACES_URL!,
    region: env.AWS_REGION! || "blr1",
    // region: process.env.S3_UPLOAD_REGION! || "blr1",
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID! || "AKIAV66644JW66644",
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY! || "AKIAV66644JW66644"
    }
  });
  const fileParams = {
    Bucket: env.AWS_BUCKET  || "vyan-doctor"  ,
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

const uploadProfessionalUserImage = async (_professionalUserId : string,_fileKey: string,fileName: string, mimeType: string, comments: string = '') => {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    };
  }
  const professionalUserId = session.user.id;
  const key = buildOwnedKey(professionalUserId, 'images', fileName);
 
  
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
  //  where : {
  //   // id : mediaId,
  //   professionalUser : {
  //     id : professionalUserId
  //   }
  //  }
    });
    console.log("before uploading")
    const url = await getUploadPresignedUrl(key, true, mimeType);
    console.log("after uploading", url)
    // revalidatePath("/auth/register/uploads")
    // revalidatePath('/admin/media');
  
    return {
      id: media.id,
      key,
      fileUrl,
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
  const session = await getServerAuthSession();

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
  const session = await getServerAuthSession();

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
