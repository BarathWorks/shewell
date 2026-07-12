"use server";

import { getServerSession } from "next-auth";
import { db } from "~/server/db";

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
          },
        },
      },
    });
    return doctor;
  } catch (error) {
    console.error("Failed to fetch doctor profile for header", error);
    return null;
  }
}
