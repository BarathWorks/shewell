"use server";

import bcrypt from "bcrypt";
import { db } from "~/server/db";
import { consumeRateLimit, resetRateLimit } from "@repo/database";
import { logger } from "@repo/observability";
import { peekResetSubject, verifyResetToken } from "~/lib/reset-token";

interface IResetPasswordActionProps {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Consumes a password-reset token.
 *
 * The token is verified against the account's *current* password hash, so it stops
 * working the moment the password changes — which is what makes it single use.
 * Previously it was signed with `EMAIL_JWT_SECRET`, configured nowhere, so this
 * flow threw on every attempt and no password could be reset at all.
 */

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 8;

const resetPasswordAction = async ({
  token,
  password,
  confirmPassword,
}: IResetPasswordActionProps) => {
  // One message for expired, forged and already-used tokens alike: the distinction
  // helps no legitimate user and together they form an oracle.
  const invalid = {
    success: false,
    message: "Your link has expired and is no longer usable.",
  };

  if (!token) return invalid;

  const subject = peekResetSubject(token);
  if (!subject) return invalid;

  // Bound to the token's subject so a stolen token cannot be brute-forced against.
  const attempt = await consumeRateLimit(db, {
    scope: "reset:consume",
    subject,
    limit: 10,
    windowSeconds: 15 * 60,
  });

  if (!attempt.allowed) {
    logger.warn("reset.consume_rate_limited", { source: "auth", userId: subject });
    return invalid;
  }

  const user = await db.user.findFirst({
    where: { id: subject, deletedAt: null },
    select: { id: true, passwordHash: true },
  });

  if (!user) return invalid;

  // Checked against the current hash — this is the single-use check.
  const verifiedId = verifyResetToken(token, user.passwordHash);
  if (!verifiedId || verifiedId !== user.id) {
    logger.warn("reset.token_rejected", { source: "auth", userId: subject });
    return invalid;
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match" };
  }

  if (password.trim().length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

    await db.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    });

    // The hash has changed, so every token issued against the old one — including
    // this one — no longer verifies.
    await resetRateLimit(db, "reset:consume", user.id);

    logger.info("reset.completed", { source: "auth", userId: user.id });

    return {
      success: true,
      message: "Password reset successfully. You can now sign in.",
    };
  } catch (error) {
    logger.error("reset.failed", { source: "auth", userId: user.id, error });
    return invalid;
  }
};

export default resetPasswordAction;
