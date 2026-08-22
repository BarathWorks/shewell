"use server";

import { db } from "~/server/db";
import { sendEmail } from "@repo/mail";
import { consumeRateLimit } from "@repo/database";
import { logger } from "@repo/observability";
import { generateOtp, OTP_VALIDITY_MINUTES } from "~/lib/otp";

/**
 * Issues an email-verification code to a practitioner.
 *
 * Called twice: once by the account-setup step immediately after the account is
 * created, and again whenever the practitioner asks to resend.
 *
 * Unlike the patient sign-in equivalent this does not have to hide whether an
 * account exists — reaching this action means the address was just typed into
 * either registration or the "verify your email" screen, both of which already say
 * whether the account is there. What it does have to do is stay bounded: unbounded,
 * it mails an arbitrary address on demand.
 *
 * Results are returned, never thrown: Next.js replaces the message of an error
 * thrown out of a Server Action with a generic string in production builds.
 */

const OTP_SEND_LIMIT = 5;
const OTP_SEND_WINDOW_SECONDS = 15 * 60;

export type SendVerificationOtpResult =
  | { status: "sent"; message: string; email: string }
  | {
      status: "error";
      code: "INVALID_EMAIL" | "NOT_FOUND" | "ALREADY_VERIFIED" | "RATE_LIMITED" | "MAIL_FAILED" | "UNKNOWN";
      message: string;
      email: string;
    };

const sendVerificationOtp = async (
  email: string,
): Promise<SendVerificationOtpResult> => {
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
    scope: "verify:doctor:send",
    subject: normalized,
    limit: OTP_SEND_LIMIT,
    windowSeconds: OTP_SEND_WINDOW_SECONDS,
  });

  if (!limit.allowed) {
    logger.warn("verify.doctor_send_rate_limited", {
      source: "auth",
      route: "sendVerificationOtp",
      retryAfterSeconds: limit.retryAfterSeconds,
    });
    return {
      status: "error",
      code: "RATE_LIMITED",
      message: `Too many requests. Please try again in ${Math.ceil(
        limit.retryAfterSeconds / 60,
      )} minute(s).`,
      email: normalized,
    };
  }

  try {
    const professionalUser = await db.professionalUser.findFirst({
      where: { email: { equals: normalized, mode: "insensitive" }, deletedAt: null },
      select: { id: true, email: true, firstName: true, userName: true, emailVerifiedAt: true },
    });

    if (!professionalUser) {
      return {
        status: "error",
        code: "NOT_FOUND",
        message: "No practitioner account found with this email. Please create an account first.",
        email: normalized,
      };
    }

    if (professionalUser.emailVerifiedAt) {
      return {
        status: "error",
        code: "ALREADY_VERIFIED",
        message: "This email is already verified. You can sign in.",
        email: normalized,
      };
    }

    const otp = generateOtp();

    await db.professionalUser.update({
      where: { id: professionalUser.id },
      data: {
        otp,
        otpCreatedAt: new Date(),
        // A newly issued code starts with a clean attempt budget and clears any
        // lockout from the previous one.
        otpAttempts: 0,
        otpLockedUntil: null,
      },
    });

    // `firstName` is null until step 2, so a practitioner verifying straight after
    // signup has no name yet — the username is what they chose and recognise.
    const greeting = professionalUser.firstName || professionalUser.userName;

    try {
      await sendEmail({
        to: [professionalUser.email],
        subject: "Verify your SheWellCare practitioner account",
        html: `<p>Hi <strong>${greeting}</strong>,</p>
        <p>Use this code to verify your practitioner account:</p>
        <p><strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
        <p>This code is valid for ${OTP_VALIDITY_MINUTES} minutes.</p>
        <p>If you did not create this account, you can ignore this email.</p>`,
        text: `Hi ${greeting}, your SheWellCare practitioner verification code is ${otp}. It is valid for ${OTP_VALIDITY_MINUTES} minutes.`,
      });
    } catch (mailError) {
      logger.error("verify.doctor_mail_failed", {
        source: "auth",
        route: "sendVerificationOtp",
        professionalUserId: professionalUser.id,
        error: mailError,
      });

      // In development, surface the code so an unconfigured mail transport does not
      // block local signup. Never in production: an OTP in a log is a credential in
      // a log, which is why the redaction layer strips this key everywhere else.
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[dev] Email delivery failed. Practitioner verification code for ${professionalUser.email}: ${otp}`,
        );
        return {
          status: "sent",
          message: "Verification code sent to your email",
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
      message: "Verification code sent to your email",
      email: normalized,
    };
  } catch (error) {
    logger.error("verify.doctor_send_failed", {
      source: "auth",
      route: "sendVerificationOtp",
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

export default sendVerificationOtp;
