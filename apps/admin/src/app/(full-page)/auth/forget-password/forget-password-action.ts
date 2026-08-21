'use server';

import { db } from '@/src/server/db';
import { sendEmail } from '@repo/mail';
import { consumeRateLimit } from '@repo/database';
import { logger } from '@repo/observability';
import { buildResetToken } from '@/src/server/reset-token';

interface IForgetPasswordActionProps {
  email: string;
}

/**
 * Issues an admin password-reset link.
 *
 * Deliberately unauthenticated — it has to be. Three things this previously got
 * wrong:
 *
 *   - The email was never sent: `sendEmail` was commented out and the link was
 *     written to the server log instead, putting an account-takeover token in
 *     plaintext wherever logs are readable.
 *   - It signed with `EMAIL_JWT_SECRET`, which is not configured anywhere, so
 *     `jwt.sign` threw and the flow could not work at all.
 *   - There was no rate limit, so it could be used to flood an inbox.
 *
 * The response is uniform whether or not the address exists.
 */

const RESET_LIMIT = 5;
const RESET_WINDOW_SECONDS = 60 * 60;

const forgetPasswordAction = async ({ email }: IForgetPasswordActionProps) => {
  const normalized = (email ?? '').trim().toLowerCase();

  // Identical response in every branch below.
  const response = {
    message: 'If that email has an account, reset instructions are on their way.'
  };

  if (!normalized) return response;

  const limit = await consumeRateLimit(db, {
    scope: 'admin:reset',
    subject: normalized,
    limit: RESET_LIMIT,
    windowSeconds: RESET_WINDOW_SECONDS
  });

  if (!limit.allowed) {
    logger.warn('admin.reset_rate_limited', {
      source: 'admin-auth',
      retryAfterSeconds: limit.retryAfterSeconds
    });
    return response;
  }

  const user = await db.adminUser.findFirst({
    where: {
      email: { equals: normalized, mode: 'insensitive' },
      // A disabled account must not be recoverable.
      active: true
    },
    select: { id: true, name: true, email: true, passwordHash: true }
  });

  if (!user) {
    logger.info('admin.reset_unknown_email', { source: 'admin-auth' });
    return response;
  }

  const token = buildResetToken(user.id, user.passwordHash);
  const link = `${process.env.NEXTAUTH_URL}/auth/reset-password?resetPasswordToken=${token}`;

  try {
    await sendEmail({
      from: process.env.FROM_EMAIL!,
      subject: 'Reset your Shewell admin password',
      to: [user.email],
      html: `<p>Hi <strong>${user.name}</strong>,</p>
             <p>Use the link below to reset your admin password. It is valid for one hour and can be used once.</p>
             <p><a href="${link}">${link}</a></p>
             <p>If you did not request this, you can ignore this email — your password will not change.</p>`
    });

    // The link itself is never logged: it is equivalent to a password.
    logger.info('admin.reset_sent', { source: 'admin-auth', userId: user.id });
  } catch (error) {
    logger.error('admin.reset_email_failed', { source: 'admin-auth', userId: user.id, error });
  }

  return response;
};

export default forgetPasswordAction;
