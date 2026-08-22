"use server";

import crypto from "crypto";
import { db } from "~/server/db";
import { consumeRateLimit, resetRateLimit } from "@repo/database";
import { logger } from "@repo/observability";
import { generateOtp } from "~/lib/utils";

/**
 * Verifies the registration OTP and creates the account.
 *
 * A six-digit code is one of a million possibilities, so three controls apply:
 *   - a per-registration attempt budget, with a lockout once spent;
 *   - a per-address request limit, so the budget cannot simply be reset by asking
 *     for new codes in a loop;
 *   - constant-time comparison.
 *
 * Results are returned rather than thrown: Next.js replaces the message of an
 * error thrown out of a Server Action with a generic string in production, so
 * every specific reason below ("OTP has expired", "Invalid OTP") reached users as
 * "An unexpected error occurred".
 */

const MAX_OTP_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;
const VERIFY_LIMIT = 20;
const VERIFY_WINDOW_SECONDS = 5 * 60;

/**
 * Discriminated on a string rather than a `success: boolean`.
 *
 * This app compiles with `strict: false`, and with `strictNullChecks` off
 * TypeScript will not narrow a union on a boolean-literal discriminant: every
 * `if (!result.success)` branch still saw the success shape, so reading the error
 * code inside it was a type error. A string discriminant narrows in both modes.
 */
export type VerifyOtpResult =
  | {
      status: "verified";
      message: string;
      email: string;
      /**
       * A fresh single-use login code for the account that was just created.
       *
       * The caller signs in with it immediately. This exists because the browser
       * has no password to sign in with at this point — the registration form
       * collected one, but the OTP page is a separate navigation and does not have
       * it. The page used to call `signIn("CrendentialsVyanClient")` with no
       * password at all, which always failed, and then pushed to `/` anyway: users
       * finished registration unauthenticated and silently.
       *
       * It is returned only to the browser that just proved control of this
       * address, and the OTP provider consumes it on first use.
       */
      signInOtp: string;
    }
  | {
      status: "error";
      code:
        | "MISSING_EMAIL"
        | "NOT_FOUND"
        | "LOCKED_OUT"
        | "EXPIRED"
        | "INVALID_OTP"
        | "RATE_LIMITED"
        | "UNKNOWN";
      message: string;
    };

/** Constant-time compare; an empty stored code never matches. */
function otpMatches(expected: string | null | undefined, received: string | null | undefined) {
  if (!expected || !received) return false;
  const a = Buffer.from(String(expected), "utf8");
  const b = Buffer.from(String(received), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const verifyOtpAction = async ({
  otp,
  email,
}: {
  otp: string;
  email: string;
}): Promise<VerifyOtpResult> => {
  const normalized = (email ?? "").trim().toLowerCase();

  if (!normalized) {
    return {
      status: "error",
      code: "MISSING_EMAIL",
      message: "Email is required for verification.",
    };
  }

  const limit = await consumeRateLimit(db, {
    scope: "register:verify",
    subject: normalized,
    limit: VERIFY_LIMIT,
    windowSeconds: VERIFY_WINDOW_SECONDS,
  });

  if (!limit.allowed) {
    logger.warn("register.verify_rate_limited", { source: "auth", route: "verifyOtp" });
    return {
      status: "error",
      code: "RATE_LIMITED",
      message: "Too many attempts. Please request a new OTP later.",
    };
  }

  try {
    const pendingUser = await db.pendingUser.findUnique({
      where: { email: normalized },
    });

    if (!pendingUser) {
      return {
        status: "error",
        code: "NOT_FOUND",
        message: "Registration not found. Please register again.",
      };
    }

    if (pendingUser.otpLockedUntil && pendingUser.otpLockedUntil > new Date()) {
      const minutes = Math.ceil((pendingUser.otpLockedUntil.getTime() - Date.now()) / 60000);
      return {
        status: "error",
        code: "LOCKED_OUT",
        message: `Too many incorrect attempts. Please try again in ${minutes} minute(s).`,
      };
    }

    if (new Date() > pendingUser.otpExpiresAt) {
      return {
        status: "error",
        code: "EXPIRED",
        message: "OTP has expired. Please request a new one.",
      };
    }

    if (!otpMatches(pendingUser.otp, otp)) {
      const attempts = pendingUser.otpAttempts + 1;
      const exhausted = attempts >= MAX_OTP_ATTEMPTS;

      await db.pendingUser.update({
        where: { email: normalized },
        data: {
          otpAttempts: attempts,
          // Burn the code as well as locking out, or it stays guessable once the
          // lockout expires.
          ...(exhausted
            ? {
                otpLockedUntil: new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000),
                otp: "",
              }
            : {}),
        },
      });

      logger.warn("register.otp_incorrect", {
        source: "auth",
        route: "verifyOtp",
        attempts,
        lockedOut: exhausted,
      });

      return {
        status: "error",
        code: exhausted ? "LOCKED_OUT" : "INVALID_OTP",
        message: exhausted
          ? `Too many incorrect attempts. Please request a new OTP in ${LOCKOUT_MINUTES} minutes.`
          : `Invalid OTP. ${MAX_OTP_ATTEMPTS - attempts} attempt(s) remaining.`,
      };
    }

    // Single-use hand-off to the sign-in provider, valid for the same five minutes
    // as any other login code.
    const signInOtp = generateOtp();

    const newUser = await db.user.create({
      data: {
        name: pendingUser.name,
        email: pendingUser.email,
        passwordHash: pendingUser.passwordHash,
        phoneNumber: pendingUser.phoneNumber,
        ageGreaterThan18: pendingUser.ageGreaterThan18,
        // Not the registration code — that one has served its purpose and a
        // populated registration OTP on a live account is a stale credential.
        otp: signInOtp,
        otpCreatedAt: new Date(),
        verifiedAt: new Date(),
      },
    });

    await db.pendingUser.delete({ where: { email: normalized } });
    await resetRateLimit(db, "register:verify", normalized);

    logger.info("register.verified", { source: "auth", route: "verifyOtp", userId: newUser.id });

    return {
      status: "verified",
      message: "Your account has been verified",
      email: newUser.email,
      signInOtp,
    };
  } catch (error) {
    logger.error("register.verify_failed", { source: "auth", route: "verifyOtp", error });
    return {
      status: "error",
      code: "UNKNOWN",
      message: "Your account has not been verified. Please try again.",
    };
  }
};

export default verifyOtpAction;
