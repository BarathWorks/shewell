'use server';

import { db } from '@/src/server/db';
import bcrypt from 'bcrypt';
import { consumeRateLimit, resetRateLimit } from '@repo/database';
import { logger } from '@repo/observability';
import { peekResetSubject, verifyResetToken } from '@/src/server/reset-token';

interface IResetPasswordActionProps {
  token: string;
  password: string;
  confirmPassword: string;
}

/**
 * Consumes an admin password-reset token.
 *
 * The token is verified against the account's *current* password hash, so it stops
 * working the instant the password changes — which is what makes it single use.
 * Previously a token stayed valid for its full four hours no matter how many times
 * it was used.
 */

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 12;

const resetPasswordAction = async ({ token, password, confirmPassword }: IResetPasswordActionProps) => {
  // Same message for an expired, forged or already-used token: none of those
  // distinctions help a legitimate user, and together they form an oracle.
  const invalid = {
    success: false,
    message: 'Your link has expired and is no longer usable.'
  };

  if (!token) return invalid;

  const subject = peekResetSubject(token);
  if (!subject) return invalid;

  // Bound to the token subject so a stolen token cannot be brute-forced against.
  const attempt = await consumeRateLimit(db, {
    scope: 'admin:reset-consume',
    subject,
    limit: 10,
    windowSeconds: 15 * 60
  });
  if (!attempt.allowed) {
    logger.warn('admin.reset_consume_rate_limited', { source: 'admin-auth', userId: subject });
    return invalid;
  }

  const user = await db.adminUser.findFirst({
    where: { id: subject, active: true },
    select: { id: true, passwordHash: true }
  });

  if (!user) return invalid;

  // Signature is checked against the current hash — this is the single-use check.
  const verifiedId = verifyResetToken(token, user.passwordHash);
  if (!verifiedId || verifiedId !== user.id) {
    logger.warn('admin.reset_token_rejected', { source: 'admin-auth', userId: subject });
    return invalid;
  }

  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match' };
  }

  if (password.trim().length < MIN_PASSWORD_LENGTH) {
    return {
      success: false,
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    };
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: hashedPassword }
  });

  // The hash has changed, so every token issued against the old one — including
  // this one — no longer verifies.
  await resetRateLimit(db, 'admin:reset-consume', user.id);

  logger.info('admin.password_reset', { source: 'admin-auth', userId: user.id });

  return { success: true, message: 'Password reset successfully' };
};

export default resetPasswordAction;
