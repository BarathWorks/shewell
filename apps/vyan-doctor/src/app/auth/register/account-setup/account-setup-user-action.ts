"use server";
import { db } from "~/server/db";
import { hash } from "bcrypt";
import { z } from "zod";
import { consumeRateLimit } from "@repo/database";
import { logger } from "@repo/observability";

interface IAccountSetupProps {
  userName: string;
  email: string;
  password: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

/**
 * Creates a practitioner account.
 *
 * This had no rate limit and no validation of any kind: no email format check, no
 * password policy, and no constraint on `userName` — which becomes a public profile
 * URL segment at `/doctor-profile/[username]`. Every call also ran a bcrypt hash,
 * so an unbounded endpoint was a cheap way to burn CPU as well as to fill the table
 * with junk accounts.
 *
 * The cost factor is 12 here, matching the admin and password-reset paths. It was
 * 10, which is below what the rest of the codebase settled on for credentials of
 * this sensitivity.
 */
const BCRYPT_COST = 12;

const schema = z.object({
  userName: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(40, "Username must be 40 characters or fewer")
    // Constrained because this value is placed directly into a public URL path.
    .regex(
      /^[a-z0-9][a-z0-9._-]*$/i,
      "Username may use letters, numbers, dots, underscores and hyphens only",
    ),
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
});

const AccountSetupUserAction = async ({
  userName,
  email,
  password,
}: IAccountSetupProps): Promise<ActionResult> => {
  const parsed = schema.safeParse({ userName, email, password });

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
      route: "AccountSetupUserAction",
    });
    return {
      success: false,
      error: `Too many attempts. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`,
    };
  }

  // Compared case-insensitively against the stored value. The previous check
  // matched on the raw input while storing a lowercased address, so the two
  // disagreed and only the unique index caught the duplicate — as an opaque
  // "Failed SignUp".
  const existingUser = await db.professionalUser.findFirst({
    where: { email: { equals: data.email, mode: "insensitive" } },
    select: { id: true },
  });

  if (existingUser) {
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
        email: data.email,
        userName: data.userName,
        passwordHash,
      },
    });

    logger.info("register.doctor_created", {
      source: "auth",
      route: "AccountSetupUserAction",
    });

    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (error) {
    // The unique indexes on email and userName are the real guard against the
    // check-then-create race above; this turns a collision into a usable message.
    const code = (error as { code?: string })?.code;
    if (code === "P2002") {
      return {
        success: false,
        error: "An account with that email or username already exists",
      };
    }

    logger.error("register.doctor_failed", {
      source: "auth",
      route: "AccountSetupUserAction",
      error,
    });
    return { success: false, error: "Failed SignUp" };
  }
};

export default AccountSetupUserAction;
