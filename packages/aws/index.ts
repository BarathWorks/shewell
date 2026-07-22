import {
  S3,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectRequest, ObjectCannedACL
} from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { addSeconds } from 'date-fns/addSeconds';

const getS3Client = () => {
  return new S3({
    region: process.env.AWS_REGION || process.env.S3_UPLOAD_REGION || "ap-south-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.S3_UPLOAD_KEY!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_UPLOAD_SECRET!,
    },
  });
};

export const getUploadPresignedUrl = async (key: string, isPublic: boolean) => {
  const bucket = process.env.AWS_BUCKET || process.env.S3_UPLOAD_BUCKET;
  const fileParams = {
    Bucket: bucket,
    Key: key,
    ContentType: "text",
    Expires: addSeconds(new Date(), 600),
    ACL: isPublic ? ObjectCannedACL.public_read : ObjectCannedACL.private,
  };
  const command = new PutObjectCommand(fileParams);
  const url = await getSignedUrl(getS3Client(), command, { expiresIn: 10 * 60 });
  return url;
};

export const getPublicFileUrl = (key: string) => {
  const bucket = process.env.AWS_BUCKET || process.env.S3_UPLOAD_BUCKET;
  const region = process.env.AWS_REGION || process.env.S3_UPLOAD_REGION || "ap-south-1";
  const imageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  if (!imageUrl) {
    throw Error("Image not Found");
  }
  return imageUrl;
};

export const getPrivateFileUrl = async (key: string) => {
  if (!key) return null;
  const bucket = process.env.AWS_BUCKET || process.env.S3_UPLOAD_BUCKET;
  if (!bucket) {
    console.error("Missing AWS_BUCKET or S3_UPLOAD_BUCKET environment variable.");
    return null;
  }
  const fileParams = {
    Bucket: bucket,
    Key: key,
  };
  try {
    const command = new GetObjectCommand(fileParams);
    const url = await getSignedUrl(getS3Client(), command, { expiresIn: 60 * 60 });
    return url;
  } catch (err) {
    console.log('BUCKET', err, key, process.env.AWS_REGION, process.env.AWS_BUCKET);
    return null;
  }
};

export const deleteS3File = async (key: string) => {
  let fileParams: DeleteObjectRequest;
  if (process.env.S3_UPLOAD_BUCKET) {
    fileParams = {
      Bucket: process.env.S3_UPLOAD_BUCKET,
      Key: key,
    };
    s3.deleteObject(fileParams, (err, data) => {
      if (err) {
        return { success: false, message: err.message };
      } else {
        return { success: true, message: "Deleted file successfully." };
      }
    });
  }
};

export const makePublic = async (key: string) => {
  try {
    return s3.putObjectAcl({
      Bucket: process.env.S3_UPLOAD_BUCKET!,
      Key: key,
      ACL: "public-read",
    });
  } catch (e) {
    // console.log(e);
  }
};
