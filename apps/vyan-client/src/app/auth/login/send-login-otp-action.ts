"use server";
import { db } from "~/server/db";
import { generateOtp } from "~/lib/utils";
import { sendEmail } from "@repo/mail";
import { consumeRateLimit } from "@repo/database";
import { logger } from "@repo/observability";

/**
 * Issues a login OTP.
 *
 * Two deliberate behaviours:
 *
 * 1. **Rate limited per address.** Unbounded, this endpoint mails an arbitrary
 *    address on demand — usable to flood someone's inbox and to burn through
 *    OTPs faster than the attempt limit on verification can bite.
 *
 * 2. **Uniform response.** It no longer reveals whether an address is registered.
 *    Distinct errors let anyone test addresses to learn who is a patient here,
 *    which for a healthcare product is a disclosure in itself. The trade-off is
 *    that a mistyped address now fails at the OTP step rather than immediately;
 *    to restore the old behaviour, return the specific errors below instead of
 *    `genericResponse`.
 */

const OTP_SEND_LIMIT = 5;
// 5 minutes. Same length as the OTP's validity, so a user who is genuinely
// locked out only has to wait as long as the code they were sent lasts.
const OTP_SEND_WINDOW_SECONDS = 5 * 60;

const sendLoginOtp = async (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const normalized = email.trim().toLowerCase();

  // Same shape whether or not an account exists.
  const genericResponse = {
    message: "If that email has an account, an OTP is on its way.",
    email: normalized,
  };

  const limit = await consumeRateLimit(db, {
    scope: "otp:send",
    subject: normalized,
    limit: OTP_SEND_LIMIT,
    windowSeconds: OTP_SEND_WINDOW_SECONDS,
  });

  if (!limit.allowed) {
    logger.warn("otp.send_rate_limited", {
      source: "auth",
      route: "sendLoginOtp",
      retryAfterSeconds: limit.retryAfterSeconds,
    });
    throw new Error(
      `Too many OTP requests. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`
    );
  }

  try {
    // A practitioner signing in here is a routing mistake, not an attack, and the
    // portals are public knowledge — so this one stays specific.
    const isDoctorAccount = await db.professionalUser.findFirst({
      where: { email: normalized },
      select: { id: true },
    });

    if (isDoctorAccount) {
      throw new Error(
        "Doctor accounts cannot access this portal. Please use the professional portal.",
      );
    }

    const user = await db.user.findFirst({
      where: {
        email: normalized,
        verifiedAt: { not: null },
      },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      // Deliberately indistinguishable from success.
      logger.info("otp.send_unknown_email", { source: "auth", route: "sendLoginOtp" });
      return genericResponse;
    }

    const otp = generateOtp();

    await db.user.update({
      where: { id: user.id },
      data: {
        otp,
        otpCreatedAt: new Date(),
        // A newly issued code starts with a clean attempt budget and clears any
        // lockout from a previous code.
        otpAttempts: 0,
        otpLockedUntil: null,
      },
    });

    const emailBody = {
      from: process.env.FROM_EMAIL!,
      subject: "Login OTP - SheWellCare",
      to: [user.email],
      html: `<p>Hi <strong>${user.name}</strong>,</p>
      <p>Your login OTP is: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
      <p>This OTP is valid for 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>`,
    };

    // A mail-provider failure must not surface as a 500.
    //
    // This threw straight out of the action, so an invalid or expired SendGrid
    // key turned sign-in into an unhandled Server Action error — and because the
    // code above has already written the new OTP, the previous one is gone too.
    // The user is left locked out with a stack trace.
    try {
      await sendEmail(emailBody);
    } catch (mailError) {
      logger.error("otp.send_mail_failed", {
        source: "auth",
        route: "sendLoginOtp",
        userId: user.id,
        error: mailError,
      });

      // In development, surface the code so a broken mail provider does not block
      // local sign-in. Never in production: an OTP in a log is a credential in a
      // log, which is why the redaction layer strips this key everywhere else.
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[dev] Email delivery failed. Login OTP for ${user.email}: ${otp}`,
        );
        return genericResponse;
      }

      throw new Error(
        "We could not send your code right now. Please try again in a moment.",
      );
    }

    return genericResponse;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to send OTP");
  }
};

export default sendLoginOtp;
