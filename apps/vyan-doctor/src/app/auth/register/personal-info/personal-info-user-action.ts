"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { subYears } from "date-fns";
import { db } from "~/server/db";
import { getServerAuthSession } from "~/server/auth";

interface ILanguageProps {
  id: string;
  name: string;
}

interface IPersonalInfoProps {
  firstName: string;
  lastName?: string;
  dob: Date;
  phoneNumber: string;
  gender: string;
  languages: ILanguageProps[];
  aboutYou: string;
  mediaId?: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Server-side validation.
 *
 * A Server Action is an HTTP endpoint. The matching form validates with zod in the
 * browser, but that is a convenience for the person filling it in, not a
 * constraint — anyone can POST this action directly with any payload. Five of the
 * seven registration steps trusted their input completely, so a practitioner
 * profile could be written with an empty name, a 400-character "position", or a
 * PAN in any shape at all.
 *
 * The rules below mirror the client schema so the two cannot disagree.
 */
const MINIMUM_AGE_YEARS = 18;

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().max(80).optional().or(z.literal("")),
  // A practitioner cannot be born in the future, and this product's practitioners
  // are adults. The form previously accepted any date the calendar could produce —
  // including next month.
  dob: z.coerce
    .date({ invalid_type_error: "Please select a valid date of birth" })
    .max(subYears(new Date(), MINIMUM_AGE_YEARS), {
      message: `You must be at least ${MINIMUM_AGE_YEARS} years old`,
    })
    .min(new Date(1900, 0, 1), { message: "Please enter a valid date of birth" }),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/, "Enter a valid phone number"),
  gender: z.string().trim().min(1, "Please select a gender").max(20),
  languages: z
    .array(z.object({ id: z.string().min(1), name: z.string().min(1) }))
    .min(1, "Please select at least one language"),
  aboutYou: z.string().trim().min(1, "Please write about yourself").max(2000),
  mediaId: z.string().trim().min(1, "Please upload a profile photo").optional(),
});

const PersonalInfoUserAction = async ({
  firstName,
  lastName,
  dob,
  phoneNumber,
  gender,
  languages,
  aboutYou,
  mediaId,
}: IPersonalInfoProps): Promise<ActionResult> => {
  const parsed = schema.safeParse({
    firstName,
    lastName,
    dob,
    phoneNumber,
    gender,
    languages,
    aboutYou,
    mediaId,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check the details entered",
    };
  }

  ({ firstName, lastName, dob, phoneNumber, gender, aboutYou, mediaId } = {
    ...parsed.data,
    lastName: parsed.data.lastName || undefined,
  });
  languages = parsed.data.languages;

  const session = await getServerAuthSession();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorised user" };
  }

  const professionalUser = await db.professionalUser.findUnique({
    where: {
      email: session.user.email,
    },
    select: {
      id: true,
    },
  });

  if (!professionalUser) {
    return { success: false, error: "Professional User does not exist" };
  }

  try {
    // Update personal info fields
    await db.professionalUser.update({
      data: {
        firstName,
        lastName: lastName || null,
        dob,
        phoneNumber,
        gender,
        aboutYou,
        ...(mediaId ? { mediaId } : {}),
      },
      where: {
        email: session.user.email,
      },
    });

    // Update languages: disconnect all first, then connect new ones
    const languageConnect = languages.map((item) => ({
      id: item.id,
      language: item.name,
    }));

    await db.professionalUser.update({
      where: {
        id: professionalUser.id,
      },
      data: {
        languages: {
          set: [],
        },
      },
    });
    await db.professionalUser.update({
      where: {
        id: professionalUser.id,
      },
      data: {
        languages: {
          connect: languageConnect,
        },
      },
    });

    revalidatePath("/auth/register/personal-info");
    return {
      success: true,
      message: "Successfully saved personal information",
    };
  } catch (error) {
    console.error("Failed to save personal info", error);
    return { success: false, error: "Failed to save personal information" };
  }
};

export default PersonalInfoUserAction;
