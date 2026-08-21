"use server";

import { db } from "~/server/db";
import { sendEmail } from "@repo/mail";
import { consumeRateLimit } from "@repo/database";
import { logger } from "@repo/observability";
import { buildResetToken } from "~/lib/reset-token";

interface IForgetPasswordActionProps {
  email: string;
}

/**
 * Issues a password-reset link.
 *
 * Unauthenticated by necessity, so two controls apply:
 *
 * 1. **Rate limited per address.** Unbounded, this mails an arbitrary address on
 *    demand — usable to flood someone's inbox.
 * 2. **Uniform response.** It no longer matters whether the address exists; the
 *    caller cannot use this to test whether someone is a customer here, which for a
 *    maternal-health product is a disclosure in itself.
 */

const RESET_LIMIT = 5;
const RESET_WINDOW_SECONDS = 60 * 60;

const forgetPasswordAction = async ({ email }: IForgetPasswordActionProps) => {
  const normalized = (email ?? "").trim().toLowerCase();

  const response = {
    message: "If that email has an account, reset instructions are on their way.",
  };

  if (!normalized) return response;

  const limit = await consumeRateLimit(db, {
    scope: "reset:send",
    subject: normalized,
    limit: RESET_LIMIT,
    windowSeconds: RESET_WINDOW_SECONDS,
  });

  if (!limit.allowed) {
    logger.warn("reset.send_rate_limited", {
      source: "auth",
      route: "forgetPassword",
      retryAfterSeconds: limit.retryAfterSeconds,
    });
    return response;
  }

  const user = await db.user.findFirst({
    where: {
      email: { equals: normalized, mode: "insensitive" },
      deletedAt: null,
    },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  if (!user) {
    logger.info("reset.send_unknown_email", { source: "auth", route: "forgetPassword" });
    return response;
  }

  const token = buildResetToken(user.id, user.passwordHash);
  const link = `${process.env.NEXTAUTH_URL}/auth/reset-password?resetPasswordToken=${token}`;

  try {
    await sendEmail({
      from: process.env.FROM_EMAIL!,
      subject: "Reset your Shewell password",
      to: [user.email],
      html: `<p>Hi <strong>${user.name}</strong>,</p>
             <p>Use the link below to reset your password. It is valid for one hour and can be used once.</p>
             <p><a href="${link}">${link}</a></p>
             <p>If you did not request this, you can ignore this email — your password will not change.</p>
             <p><strong>Team SheWell</strong></p>`,
    });

    // The link is never logged: it is equivalent to a password.
    logger.info("reset.sent", { source: "auth", route: "forgetPassword", userId: user.id });
  } catch (error) {
    logger.error("reset.email_failed", {
      source: "auth",
      route: "forgetPassword",
      userId: user.id,
      error,
    });
  }

  return response;
};

export default forgetPasswordAction;
