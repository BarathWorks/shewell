"use server";

import crypto from "crypto";
import { db } from "~/server/db";
import { consumeRateLimit, resetRateLimit } from "@repo/database";
import { logger } from "@repo/observability";

/**
 * Verifies the registration OTP and creates the account.
 *
 * A six-digit code is one of a million possibilities. This path previously had no
 * attempt budget and no rate limit — so it was walkable inside the five-minute
 * validity window, unlike the login OTP flow which was already hardened.
 *
 * Three controls, matching that flow:
 *   - a per-registration attempt budget, with a lockout once spent;
 *   - a per-address request limit, so the budget cannot simply be reset by asking
 *     for new codes in a loop;
 *   - constant-time comparison.
 */

const MAX_OTP_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 5;
const VERIFY_LIMIT = 20;
const VERIFY_WINDOW_SECONDS = 5 * 60;

/** Constant-time compare; an empty stored code never matches. */
function otpMatches(expected: string | null | undefined, received: string | null | undefined) {
  if (!expected || !received) return false;
  const a = Buffer.from(String(expected), "utf8");
  const b = Buffer.from(String(received), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

const verifyOtpAction = async ({ otp, email }: { otp: string; email: string }) => {
  if (!email) {
    throw new Error("Email is required for verification");
  }

  const normalized = email.trim().toLowerCase();

  const limit = await consumeRateLimit(db, {
    scope: "register:verify",
    subject: normalized,
    limit: VERIFY_LIMIT,
    windowSeconds: VERIFY_WINDOW_SECONDS,
  });

  if (!limit.allowed) {
    logger.warn("register.verify_rate_limited", { source: "auth", route: "verifyOtp" });
    throw new Error("Too many attempts. Please request a new OTP later.");
  }

  try {
    const pendingUser = await db.pendingUser.findUnique({
      where: { email: normalized },
    });

    if (!pendingUser) {
      throw new Error("Registration not found. Please register again.");
    }

    if (pendingUser.otpLockedUntil && pendingUser.otpLockedUntil > new Date()) {
      const minutes = Math.ceil((pendingUser.otpLockedUntil.getTime() - Date.now()) / 60000);
      throw new Error(`Too many incorrect attempts. Please try again in ${minutes} minute(s).`);
    }

    if (new Date() > pendingUser.otpExpiresAt) {
      throw new Error("OTP has expired. Please request a new one.");
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

      throw new Error(
        exhausted
          ? `Too many incorrect attempts. Please request a new OTP in ${LOCKOUT_MINUTES} minutes.`
          : "Invalid OTP",
      );
    }

    const newUser = await db.user.create({
      data: {
        name: pendingUser.name,
        email: pendingUser.email,
        passwordHash: pendingUser.passwordHash,
        phoneNumber: pendingUser.phoneNumber,
        ageGreaterThan18: pendingUser.ageGreaterThan18,
        // Not carried over from the pending record: the registration code has served
        // its purpose, and a populated `otp` on a live account is a stale credential.
        otp: "",
        verifiedAt: new Date(),
      },
    });

    await db.pendingUser.delete({ where: { email: normalized } });
    await resetRateLimit(db, "register:verify", normalized);

    logger.info("register.verified", { source: "auth", route: "verifyOtp", userId: newUser.id });

    return {
      message: "Your account has been verified",
      email: newUser.email,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Your account has not been verified");
  }
};

export default verifyOtpAction;
