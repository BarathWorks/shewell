"use server";

import { getServerSession } from "next-auth";
import { db } from "~/server/db";
import { getDownloadPresignedUrl } from "~/(main)/upload-image-actions";

export async function getDoctorProfile() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return null;
  }
  try {
    const doctor = await db.professionalUser.findFirst({
      where: {
        email: session.user.email,
        deletedAt: null,
      },
      select: {
        firstName: true,
        lastName: true,
        media: {
          select: {
            fileUrl: true,
            fileKey: true,
          },
        },
      },
    });

    if (!doctor) return null;

    let mediaUrl = doctor.media?.fileUrl || null;
    if (doctor.media?.fileKey) {
      const signedUrl = await getDownloadPresignedUrl(doctor.media.fileKey);
      if (signedUrl) {
        mediaUrl = signedUrl;
      }
    }

    return {
      ...doctor,
      media: doctor.media ? { fileUrl: mediaUrl } : null,
    };
  } catch (error) {
    console.error("Failed to fetch doctor profile for header", error);
    return null;
  }
}
