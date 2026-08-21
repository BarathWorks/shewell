"use server";

import { db } from "~/server/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerAuthSession } from "~/server/auth";

interface IModesProps {
  sessionMode: string;
  listing: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

const ModesUserAction = async ({
  sessionMode,
  listing,
}: IModesProps): Promise<ActionResult> => {
  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorised user" };
  }

  const FormData = z.object({
    sessionMode: z.string().min(1, "Session mode is required"),
    listing: z.string().min(1, "Listing is required"),
  });

  const parsed = FormData.safeParse({
    sessionMode,
    listing,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message || "Invalid data" };
  }

  try {
    await db.professionalUser.update({
      data: {
        sessionMode: parsed.data.sessionMode,
        listing: parsed.data.listing,
      },
      where: {
        email: session.user.email,
      },
    });
    revalidatePath("/auth/register/modes");
    return {
      success: true,
      message: "Successfully modes added",
    };
  } catch (error) {
    console.error("Failed to save modes:", error);
    return { success: false, error: "Failed to save modes" };
  }
};

export default ModesUserAction;
