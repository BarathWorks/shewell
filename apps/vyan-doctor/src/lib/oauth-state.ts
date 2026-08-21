import "server-only";

import crypto from "crypto";

/**
 * CSRF protection for the Google Calendar connect flow.
 *
 * The authorization URL carried no `state` and the callback verified none, so the
 * flow had no way to tell its own request apart from one somebody else started.
 * That is the classic OAuth CSRF: induce a signed-in practitioner to load the
 * callback with an attacker's `code`, and the attacker's Google account gets bound
 * to the practitioner's profile — after which every consultation's calendar event
 * and Meet link is created in a calendar the attacker controls.
 *
 * The state is a signed, expiring token bound to the practitioner it was issued
 * for. It is verified against the *session at callback time*, so a state minted for
 * one account cannot be replayed into another's.
 *
 * Derived from `NEXTAUTH_SECRET` rather than introducing another secret to manage —
 * the same approach the admin password-reset tokens take.
 */

const STATE_TTL_MS = 10 * 60 * 1000;

function key(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required to issue OAuth state");
  }
  return crypto.createHmac("sha256", secret).update("google-oauth-state").digest();
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", key()).update(payload).digest("base64url");
}

/** Mints a state token for this practitioner. */
export function createOAuthState(professionalUserId: string): string {
  const nonce = crypto.randomBytes(16).toString("base64url");
  const expiresAt = Date.now() + STATE_TTL_MS;
  const payload = `${professionalUserId}.${nonce}.${expiresAt}`;
  return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
}

/**
 * Returns true when `state` is a token this server issued, for this practitioner,
 * and still within its window.
 */
export function verifyOAuthState(
  state: string | null,
  professionalUserId: string,
): boolean {
  if (!state) return false;

  const separator = state.lastIndexOf(".");
  if (separator <= 0) return false;

  const encoded = state.slice(0, separator);
  const received = state.slice(separator + 1);

  let payload: string;
  try {
    payload = Buffer.from(encoded, "base64url").toString("utf8");
  } catch {
    return false;
  }

  const expected = sign(payload);

  // Constant-time, so a valid signature cannot be recovered by timing the response.
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  if (!crypto.timingSafeEqual(a, b)) return false;

  const [subject, , expiresAt] = payload.split(".");
  if (!subject || !expiresAt) return false;

  // Bound to the caller: a state issued for another practitioner must not pass.
  if (subject !== professionalUserId) return false;

  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  return true;
}
