"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

interface IUploadsProps {
  aboutYou: string;
  mediaId: string;
  documents: {
    documentId?: string;
  }[];
  aadharCard?: string;
  panCard?: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

const UploadsUserAction = async ({
  aboutYou,
  mediaId,
  documents,
  aadharCard,
  panCard,
}: IUploadsProps): Promise<ActionResult> => {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorised user" };
  }

  const formData = z.object({
    aboutYou: z.string().min(1, "About you is required"),
    mediaId: z.string().min(1, "Profile photo is required"),
    documents: z.array(
      z.object({
        documentId: z.string().optional(),
      }),
    ),
    aadharCard: z.string().optional(),
    panCard: z.string().optional(),
  });

  const parsed = formData.safeParse({
    aboutYou,
    mediaId,
    documents,
    aadharCard,
    panCard,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Invalid data" };
  }

  try {
    const professionalUser = await db.professionalUser.findFirst({
      where: {
        email: session.user.email,
      },
      select: {
        id: true,
      },
    });

    if (!professionalUser) {
      return { success: false, error: "Professional user not found" };
    }

    await db.professionalUser.update({
      data: {
        aboutYou: parsed.data.aboutYou,
      },
      where: {
        email: session.user.email,
      },
    });

    revalidatePath("/auth/register/uploads");
    return {
      success: true,
      message: "Successfully added uploads",
    };
  } catch (error) {
    console.error("Error saving uploads:", error);
    return { success: false, error: "Failed to save uploads" };
  }
};

export default UploadsUserAction;
