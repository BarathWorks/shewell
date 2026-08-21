import {
  S3,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ObjectCannedACL
} from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { addSeconds } from 'date-fns/addSeconds';

/**
 * S3 access.
 *
 * This module referred to two different sets of variables for the same thing:
 * uploads and downloads used `AWS_BUCKET` / `AWS_REGION`, while `getPublicFileUrl`,
 * `deleteS3File` and `makePublic` used `S3_UPLOAD_BUCKET` / `S3_UPLOAD_REGION` —
 * names declared in no env schema and set in no env file. The effects were:
 *
 *   - `getPublicFileUrl` built a URL from two `undefined`s and then returned
 *     nothing at all (a template literal is never falsy, so its `if (!imageUrl)`
 *     guard could not fire).
 *   - `deleteS3File` was wrapped in `if (process.env.S3_UPLOAD_BUCKET)`, so with
 *     that variable unset it silently deleted nothing and reported nothing.
 *   - `makePublic` would have called S3 with `Bucket: undefined`.
 *
 * There is now one bucket and one region, read through helpers that fail with a
 * named variable instead of sending `undefined` to AWS.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set; S3 access is not configured.`);
  }
  return value;
}

const bucket = () => requireEnv('AWS_BUCKET');
const region = () => requireEnv('AWS_REGION');

const s3 = new S3({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const getUploadPresignedUrl = async (key: string, isPublic: boolean) => {
  const command = new PutObjectCommand({
    Bucket: bucket(),
    Key: key,
    ContentType: "text",
    Expires: addSeconds(new Date(), 600),
    ACL: isPublic ? ObjectCannedACL.public_read : ObjectCannedACL.private,
  });

  return getSignedUrl(s3, command, { expiresIn: 10 * 60 });
};

/** Public URL for an object stored with a public-read ACL. */
export const getPublicFileUrl = (key: string): string => {
  if (!key) {
    throw new Error("Cannot build a file URL without a key.");
  }
  return `https://${bucket()}.s3.${region()}.amazonaws.com/${key}`;
};

export const getPrivateFileUrl = async (key: string) => {
  try {
    const command = new GetObjectCommand({ Bucket: bucket(), Key: key });
    return await getSignedUrl(s3, command, { expiresIn: 10 * 60 });
  } catch (err) {
    console.error('S3 getPrivateFileUrl failed', { key, error: err });
    return;
  }
};

/** Deletes one object. Awaited, so the caller learns whether it actually happened. */
export const deleteS3File = async (key: string) => {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: bucket(), Key: key }));
    return { success: true, message: "Deleted file successfully." };
  } catch (err) {
    console.error('S3 deleteS3File failed', { key, error: err });
    return { success: false, message: (err as Error).message };
  }
};

export const makePublic = async (key: string) => {
  try {
    return await s3.putObjectAcl({
      Bucket: bucket(),
      Key: key,
      ACL: "public-read",
    });
  } catch (err) {
    console.error('S3 makePublic failed', { key, error: err });
    return;
  }
};
