import "server-only";

import crypto from "crypto";
import jwt from "jsonwebtoken";

/**
 * Password-reset tokens for customer accounts.
 *
 * The signing key is derived from `NEXTAUTH_SECRET` **and the account's current
 * password hash**. That binding is what makes a token single-use: once the password
 * changes the hash changes, the derived key changes, and every token issued against
 * the old password stops verifying.
 *
 * What this replaces: tokens signed with `EMAIL_JWT_SECRET`, a variable configured
 * nowhere in this project — so `jwt.verify` threw and password reset could not work
 * at all. The payload was also just `{ email }` with nothing to consume it, so a
 * single intercepted link would have reset the password repeatedly for four hours,
 * and kept working after the password had already been changed.
 *
 * Deriving from `NEXTAUTH_SECRET` avoids introducing another secret to configure and
 * forget.
 */

const TOKEN_TTL_SECONDS = 60 * 60;

function signingKey(passwordHash: string): string {
  const base = process.env.NEXTAUTH_SECRET;
  if (!base) {
    throw new Error("NEXTAUTH_SECRET is required to issue password reset tokens");
  }
  // HMAC rather than concatenation, so the password hash cannot be teased back out.
  return crypto.createHmac("sha256", base).update(`reset:${passwordHash}`).digest("hex");
}

export function buildResetToken(userId: string, passwordHash: string): string {
  return jwt.sign({ sub: userId }, signingKey(passwordHash), {
    expiresIn: TOKEN_TTL_SECONDS,
  });
}

/**
 * Returns the user id when the token is valid for this account's *current*
 * password, or null. Verification needs that hash, so the caller loads the account
 * first — by the unverified `sub`, which is safe because nothing is trusted until
 * the signature checks out.
 */
export function verifyResetToken(token: string, passwordHash: string): string | null {
  try {
    const decoded = jwt.verify(token, signingKey(passwordHash)) as { sub?: string };
    return typeof decoded.sub === "string" ? decoded.sub : null;
  } catch {
    return null;
  }
}

/** Reads `sub` without verifying, only to decide which account to load. */
export function peekResetSubject(token: string): string | null {
  try {
    const decoded = jwt.decode(token) as { sub?: string } | null;
    return typeof decoded?.sub === "string" ? decoded.sub : null;
  } catch {
    return null;
  }
}
