"use server";

import { getPrivateFileUrl } from "@repo/aws";
import { getServerAuthSession } from "~/server/auth";
import { db } from "~/server/db";

const downloadDocument = async ({
  fileKey,
}: {
  fileKey: string;
}): Promise<string | null> => {
  try {
    const session = await getServerAuthSession();

    if (!session?.user?.id || !fileKey) {
      return null;
    }

    // Ownership is checked against our own records rather than by matching a key
    // prefix, so historical key formats keep working. Without this, any caller could
    // pass an arbitrary key and receive a presigned URL for it — including another
    // practitioner's Aadhaar/PAN scans.
    const document = await db.document.findFirst({
      where: {
        fileKey,
        professionalUserId: session.user.id,
      },
      select: { fileKey: true },
    });

    if (!document) {
      return null;
    }

    const url = await getPrivateFileUrl(document.fileKey);

    return url!;
  } catch (error) {
    console.log("downloadurl", error);
    return null;
  }
};
export default downloadDocument;
