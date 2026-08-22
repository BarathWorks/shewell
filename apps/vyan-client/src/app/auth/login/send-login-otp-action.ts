"use server";
import { db } from "~/server/db";
import { generateOtp } from "~/lib/utils";
import { sendEmail } from "@repo/mail";
import { consumeRateLimit } from "@repo/database";
import { logger } from "@repo/observability";

/**
 * Issues a login OTP.
 *
 * **A code is sent only when a verified account exists.** Anything else is named:
 * an address with no account is told so and pointed at registration, a half-finished
 * registration is sent back to finish verifying, and a practitioner address is sent
 * to the professional portal.
 *
 * This replaces the previous uniform "if that email has an account…" response,
 * which was there to stop the endpoint being used to test who has an account here.
 * That protection is deliberately traded away for a sign-in flow people can
 * actually complete — a mistyped address used to fail silently and then fail again
 * at the OTP step with no explanation. The rate limit below is what remains of the
 * defence: it bounds how fast addresses can be probed, and how many messages any
 * one inbox can be made to receive.
 *
 * Results are returned, never thrown. Next.js replaces the message of an error
 * thrown out of a Server Action with a generic string in production builds, so a
 * thrown "No account found" reaches the user as "An unexpected error occurred".
 */

const OTP_SEND_LIMIT = 5;
// 5 minutes. Same length as the OTP's validity, so a user who is genuinely
// locked out only has to wait as long as the code they were sent lasts.
const OTP_SEND_WINDOW_SECONDS = 5 * 60;

/**
 * Discriminated on a string rather than a `success: boolean`.
 *
 * This app compiles with `strict: false`, and with `strictNullChecks` off
 * TypeScript will not narrow a union on a boolean-literal discriminant: every
 * `if (!result.success)` branch still saw the success shape, so reading the error
 * code inside it was a type error. A string discriminant narrows in both modes.
 */
export type SendLoginOtpResult =
  | { status: "sent"; message: string; email: string }
  | {
      status: "error";
      /** Lets the form choose a destination — register, verify, or the doctor portal. */
      code:
        | "INVALID_EMAIL"
        | "NO_ACCOUNT"
        | "UNVERIFIED"
        | "DELETED_ACCOUNT"
        | "DOCTOR_ACCOUNT"
        | "RATE_LIMITED"
        | "MAIL_FAILED"
        | "UNKNOWN";
      message: string;
      email: string;
    };

const sendLoginOtp = async (email: string): Promise<SendLoginOtpResult> => {
  const normalized = (email ?? "").trim().toLowerCase();

  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) {
    return {
      status: "error",
      code: "INVALID_EMAIL",
      message: "Please enter a valid email address.",
      email: normalized,
    };
  }

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
    return {
      status: "error",
      code: "RATE_LIMITED",
      message: `Too many OTP requests. Please try again in ${Math.ceil(
        limit.retryAfterSeconds / 60,
      )} minute(s).`,
      email: normalized,
    };
  }

  try {
    // One round trip instead of three sequential ones: the answer needs all three
    // to tell "no account" apart from "wrong portal" and "not yet verified".
    const [doctorAccount, user, pendingUser] = await Promise.all([
      db.professionalUser.findFirst({
        where: { email: normalized },
        select: { id: true },
      }),
      // `deletedAt` is selected rather than filtered on. A closed account must not
      // be mailed a code, but it must not be reported as "no account" either —
      // registration refuses the address (`email` is unique on User), so the two
      // messages would send the user in a circle.
      db.user.findFirst({
        where: { email: normalized, verifiedAt: { not: null } },
        select: { id: true, name: true, email: true, deletedAt: true },
      }),
      db.pendingUser.findUnique({
        where: { email: normalized },
        select: { id: true },
      }),
    ]);

    // A practitioner signing in here is a routing mistake, and the portals are
    // public knowledge.
    if (doctorAccount) {
      return {
        status: "error",
        code: "DOCTOR_ACCOUNT",
        message:
          "This is a practitioner account. Please sign in through the professional portal.",
        email: normalized,
      };
    }

    if (user?.deletedAt) {
      logger.info("otp.send_deleted_account", { source: "auth", route: "sendLoginOtp" });
      return {
        status: "error",
        code: "DELETED_ACCOUNT",
        message:
          "This account has been closed. Please contact support if you would like it restored.",
        email: normalized,
      };
    }

    if (!user) {
      // Registered but never verified: the account is half-created, so sending
      // them to "create an account" would just hit "user already exists".
      if (pendingUser) {
        logger.info("otp.send_unverified_account", {
          source: "auth",
          route: "sendLoginOtp",
        });
        return {
          status: "error",
          code: "UNVERIFIED",
          message:
            "This email is registered but not verified yet. Please complete verification to continue.",
          email: normalized,
        };
      }

      logger.info("otp.send_unknown_email", { source: "auth", route: "sendLoginOtp" });
      return {
        status: "error",
        code: "NO_ACCOUNT",
        message: "No account found with this email. Please create an account first.",
        email: normalized,
      };
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
      subject: "Login OTP - SheWellCare",
      to: [user.email],
      html: `<p>Hi <strong>${user.name}</strong>,</p>
      <p>Your login OTP is: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
      <p>This OTP is valid for 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>`,
      text: `Hi ${user.name}, your SheWellCare login OTP is ${otp}. It is valid for 5 minutes.`,
    };

    // A mail-provider failure must not surface as a 500. The new OTP is already
    // written by this point, so the previous one is gone either way — the user has
    // to be told to retry rather than left staring at an error page.
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
        return {
          status: "sent",
          message: "OTP sent to your email",
          email: normalized,
        };
      }

      return {
        status: "error",
        code: "MAIL_FAILED",
        message: "We could not send your code right now. Please try again in a moment.",
        email: normalized,
      };
    }

    return {
      status: "sent",
      message: "OTP sent to your email",
      email: normalized,
    };
  } catch (error) {
    logger.error("otp.send_failed", {
      source: "auth",
      route: "sendLoginOtp",
      error,
    });
    return {
      status: "error",
      code: "UNKNOWN",
      message: "Something went wrong. Please try again.",
      email: normalized,
    };
  }
};

export default sendLoginOtp;
