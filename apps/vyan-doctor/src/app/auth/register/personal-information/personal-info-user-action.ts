"use server";
import { db } from "~/server/db";
import { hash } from "bcrypt";
import { z } from "zod";
import { consumeRateLimit } from "@repo/database";
import { logger } from "@repo/observability";

interface IPersInfoProps {
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  email: string;
  password: string;
  dob: Date;
  userName: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * The second practitioner sign-up route — `/auth/register/personal-information`,
 * alongside `/auth/register/account-setup`.
 *
 * Both create a `ProfessionalUser` and both are live. Rate-limiting and validating
 * only one of them would have left the limit trivially bypassable by posting to the
 * other, so this carries the same controls and shares the `register:doctor` scope
 * with it — the budget is per address across both routes, not per route.
 *
 * A `signIn` import from `next-auth/react` was removed: it is a browser-only entry
 * point and was never called here.
 */
const BCRYPT_COST = 12;

const schema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().max(80).optional().or(z.literal("")),
  phoneNumber: z
    .string()
    .trim()
    .min(6, "Enter a valid phone number")
    .max(20, "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(200, "Password must be 200 characters or fewer"),
  dob: z.coerce.date({ required_error: "Date of birth is required" }),
  userName: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(40, "Username must be 40 characters or fewer")
    // Constrained because this value becomes a public URL path segment.
    .regex(
      /^[a-z0-9][a-z0-9._-]*$/i,
      "Username may use letters, numbers, dots, underscores and hyphens only",
    ),
});

const PersInfoUserAction = async ({
  firstName,
  lastName,
  phoneNumber,
  email,
  password,
  dob,
  userName,
}: IPersInfoProps): Promise<ActionResult> => {
  const parsed = schema.safeParse({
    firstName,
    lastName,
    phoneNumber,
    email,
    password,
    dob,
    userName,
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check the details entered",
    };
  }

  const data = parsed.data;

  const limit = await consumeRateLimit(db, {
    scope: "register:doctor",
    subject: data.email,
    limit: 5,
    windowSeconds: 60 * 60,
  });

  if (!limit.allowed) {
    logger.warn("register.doctor_rate_limited", {
      source: "auth",
      route: "PersInfoUserAction",
    });
    return {
      success: false,
      error: `Too many attempts. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`,
    };
  }

  const user = await db.professionalUser.findFirst({
    where: { email: { equals: data.email, mode: "insensitive" } },
    select: { id: true },
  });

  if (user) {
    return { success: false, error: "User already exists" };
  }

  const sameUserName = await db.professionalUser.findFirst({
    where: { userName: { equals: data.userName, mode: "insensitive" } },
    select: { id: true },
  });

  if (sameUserName) {
    return { success: false, error: "This Username already exists" };
  }

  try {
    const passwordHash = await hash(data.password, BCRYPT_COST);

    await db.professionalUser.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName || null,
        phoneNumber: data.phoneNumber,
        passwordHash,
        email: data.email,
        dob: data.dob,
        userName: data.userName,
      },
    });

    logger.info("register.doctor_created", {
      source: "auth",
      route: "PersInfoUserAction",
    });

    return {
      success: true,
      message: "Successfully added the Personal Information",
    };
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "P2002") {
      return {
        success: false,
        error: "An account with that email or username already exists",
      };
    }

    logger.error("register.doctor_failed", {
      source: "auth",
      route: "PersInfoUserAction",
      error,
    });
    return { success: false, error: "Failed SignUp" };
  }
};

export default PersInfoUserAction;
