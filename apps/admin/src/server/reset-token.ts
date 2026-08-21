import 'server-only';

import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Password-reset tokens for admin accounts.
 *
 * The signing key is derived from `NEXTAUTH_SECRET` **and the account's current
 * password hash**. That binding is what makes a token single-use: the moment the
 * password changes, the hash changes, the derived key changes, and every token
 * issued against the old password stops verifying.
 *
 * The previous implementation signed `{ email }` with a standalone secret and a
 * four-hour life, with nothing to consume it — so one intercepted link could reset
 * the password repeatedly, and kept working even after the password had been
 * changed. It also referenced `EMAIL_JWT_SECRET`, which is not configured, so the
 * flow threw rather than working at all.
 *
 * Deriving from `NEXTAUTH_SECRET` avoids introducing another secret to manage and
 * to forget to set.
 */

const TOKEN_TTL_SECONDS = 60 * 60;

function signingKey(passwordHash: string): string {
  const base = process.env.NEXTAUTH_SECRET;
  if (!base) {
    throw new Error('NEXTAUTH_SECRET is required to issue password reset tokens');
  }
  // HMAC rather than concatenation, so the hash cannot be teased back out.
  return crypto.createHmac('sha256', base).update(`reset:${passwordHash}`).digest('hex');
}

export function buildResetToken(userId: string, passwordHash: string): string {
  return jwt.sign({ sub: userId }, signingKey(passwordHash), {
    expiresIn: TOKEN_TTL_SECONDS
  });
}

/**
 * Returns the user id when the token is valid for this account's *current*
 * password, or null. Verification needs the current hash, so the caller looks the
 * account up first — by the unverified `sub`, which is safe because nothing is
 * trusted until the signature checks out.
 */
export function verifyResetToken(token: string, passwordHash: string): string | null {
  try {
    const decoded = jwt.verify(token, signingKey(passwordHash)) as { sub?: string };
    return typeof decoded.sub === 'string' ? decoded.sub : null;
  } catch {
    return null;
  }
}

/** Reads `sub` without verifying, only to find which account to load. */
export function peekResetSubject(token: string): string | null {
  try {
    const decoded = jwt.decode(token) as { sub?: string } | null;
    return typeof decoded?.sub === 'string' ? decoded.sub : null;
  } catch {
    return null;
  }
}
