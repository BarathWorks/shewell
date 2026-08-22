import crypto from "crypto";

/**
 * A six-digit one-time code.
 *
 * Rejection sampling keeps the digits uniform — taking a raw byte modulo 10 would
 * make 0–5 more likely than 6–9, because 256 is not a multiple of 10. The same
 * generator backs the patient flow in `apps/vyan-client/src/lib/utils.ts`.
 *
 * Constant-time comparison lives here too, so every place that checks a code in
 * this app checks it the same way: a plain `!==` leaks the position of the first
 * wrong digit through timing, and — more usefully to an attacker — an empty stored
 * code would match an empty submission.
 */

/**
 * How long an issued verification code stays valid.
 *
 * Lives here rather than beside the action that sends it: a `"use server"` module
 * may only export async functions, so exporting a constant from one is a build
 * error. Both the send and the verify action read it from here, which is also what
 * keeps the two in step.
 */
export const OTP_VALIDITY_MINUTES = 10;

const OTP_LENGTH = 6;
/** Largest multiple of 10 below 256; bytes at or above this are discarded. */
const MAX_UNBIASED = 250;

export const generateOtp = (): string => {
  let otp = "";

  while (otp.length < OTP_LENGTH) {
    const bytes = crypto.randomBytes(OTP_LENGTH);
    for (let i = 0; i < bytes.length && otp.length < OTP_LENGTH; i++) {
      const b = bytes[i]!;
      if (b < MAX_UNBIASED) otp += String(b % 10);
    }
  }

  return otp;
};

/** Constant-time compare; an empty or absent stored code never matches. */
export const otpMatches = (
  expected: string | null | undefined,
  received: string | null | undefined,
): boolean => {
  if (!expected || !received) return false;
  const a = Buffer.from(String(expected), "utf8");
  const b = Buffer.from(String(received), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};
