"use server";

import { db } from "~/server/db";
import { consumeRateLimit, resetRateLimit } from "@repo/database";
import { logger } from "@repo/observability";
import { otpMatches, OTP_VALIDITY_MINUTES } from "~/lib/otp";

/**
 * Confirms a practitioner controls the address they registered with.
 *
 * Three controls, matching the patient flow:
 *   - a per-account attempt budget, with a lockout once spent;
 *   - a per-address request limit, so the budget cannot simply be reset by asking
 *     for new codes in a loop;
 *   - constant-time comparison, and the code is consumed on success so it cannot
 *     be replayed.
 */

const MAX_OTP_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const VERIFY_LIMIT = 20;
const VERIFY_WINDOW_SECONDS = 15 * 60;

export type VerifyEmailResult =
  | { status: "verified"; message: string; email: string }
  | {
      status: "error";
      code:
        | "MISSING_EMAIL"
        | "NOT_FOUND"
        | "ALREADY_VERIFIED"
        | "LOCKED_OUT"
        | "EXPIRED"
        | "INVALID_OTP"
        | "RATE_LIMITED"
        | "UNKNOWN";
      message: string;
    };

const verifyEmailAction = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}): Promise<VerifyEmailResult> => {
  const normalized = (email ?? "").trim().toLowerCase();

  if (!normalized) {
    return {
      status: "error",
      code: "MISSING_EMAIL",
      message: "Email is required for verification.",
    };
  }

  const limit = await consumeRateLimit(db, {
    scope: "verify:doctor:check",
    subject: normalized,
    limit: VERIFY_LIMIT,
    windowSeconds: VERIFY_WINDOW_SECONDS,
  });

  if (!limit.allowed) {
    logger.warn("verify.doctor_check_rate_limited", {
      source: "auth",
      route: "verifyEmail",
    });
    return {
      status: "error",
      code: "RATE_LIMITED",
      message: "Too many attempts. Please request a new code later.",
    };
  }

  try {
    const professionalUser = await db.professionalUser.findFirst({
      where: { email: { equals: normalized, mode: "insensitive" }, deletedAt: null },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
        otp: true,
        otpCreatedAt: true,
        otpAttempts: true,
        otpLockedUntil: true,
      },
    });

    if (!professionalUser) {
      return {
        status: "error",
        code: "NOT_FOUND",
        message: "No practitioner account found with this email.",
      };
    }

    // Idempotent: a practitioner who submits a stale tab, or clicks twice, should
    // be told they are done rather than that their code is invalid.
    if (professionalUser.emailVerifiedAt) {
      return {
        status: "error",
        code: "ALREADY_VERIFIED",
        message: "This email is already verified. You can sign in.",
      };
    }

    if (professionalUser.otpLockedUntil && professionalUser.otpLockedUntil > new Date()) {
      const minutes = Math.ceil(
        (professionalUser.otpLockedUntil.getTime() - Date.now()) / 60000,
      );
      return {
        status: "error",
        code: "LOCKED_OUT",
        message: `Too many incorrect attempts. Please try again in ${minutes} minute(s).`,
      };
    }

    // Expiry first: a consumed or never-issued code has `otpCreatedAt = null` and
    // must not be counted as a wrong guess.
    const issuedAt = professionalUser.otpCreatedAt
      ? professionalUser.otpCreatedAt.getTime()
      : 0;
    if (!issuedAt || Date.now() - issuedAt > OTP_VALIDITY_MINUTES * 60 * 1000) {
      return {
        status: "error",
        code: "EXPIRED",
        message: "That code has expired. Please request a new one.",
      };
    }

    if (!otpMatches(professionalUser.otp, otp)) {
      const attempts = professionalUser.otpAttempts + 1;
      const exhausted = attempts >= MAX_OTP_ATTEMPTS;

      await db.professionalUser.update({
        where: { id: professionalUser.id },
        data: {
          otpAttempts: attempts,
          // Burn the code as well as locking out, or it stays guessable once the
          // lockout expires.
          ...(exhausted
            ? {
                otpLockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000),
                otp: null,
                otpCreatedAt: null,
              }
            : {}),
        },
      });

      logger.warn("verify.doctor_otp_incorrect", {
        source: "auth",
        route: "verifyEmail",
        attempts,
        lockedOut: exhausted,
      });

      return {
        status: "error",
        code: exhausted ? "LOCKED_OUT" : "INVALID_OTP",
        message: exhausted
          ? `Too many incorrect attempts. Please request a new code in ${LOCKOUT_MINUTES} minutes.`
          : `Invalid code. ${MAX_OTP_ATTEMPTS - attempts} attempt(s) remaining.`,
      };
    }

    // Single use: mark verified and clear the code and the counters together.
    await db.professionalUser.update({
      where: { id: professionalUser.id },
      data: {
        emailVerifiedAt: new Date(),
        otp: null,
        otpCreatedAt: null,
        otpAttempts: 0,
        otpLockedUntil: null,
      },
    });

    await resetRateLimit(db, "verify:doctor:check", normalized);
    await resetRateLimit(db, "verify:doctor:send", normalized);

    logger.info("verify.doctor_verified", {
      source: "auth",
      route: "verifyEmail",
      professionalUserId: professionalUser.id,
    });

    return {
      status: "verified",
      message: "Your email has been verified",
      email: professionalUser.email,
    };
  } catch (error) {
    logger.error("verify.doctor_check_failed", {
      source: "auth",
      route: "verifyEmail",
      error,
    });
    return {
      status: "error",
      code: "UNKNOWN",
      message: "We could not verify your email. Please try again.",
    };
  }
};

export default verifyEmailAction;
