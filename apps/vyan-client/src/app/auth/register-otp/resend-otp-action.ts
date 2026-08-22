"use server";
import { db } from "~/server/db";
import { generateOtp } from "~/lib/utils";
import { sendEmail } from "@repo/mail";
import { consumeRateLimit } from "@repo/database";
import { logger } from "@repo/observability";

/**
 * Re-issues the registration OTP.
 *
 * Results are returned rather than thrown, for the same reason as the rest of this
 * flow: a message thrown out of a Server Action is replaced with a generic string
 * in production, so "Registration not found. Please register again." never reached
 * the person who needed to read it.
 */

/**
 * Discriminated on a string rather than a `success: boolean`.
 *
 * This app compiles with `strict: false`, and with `strictNullChecks` off
 * TypeScript will not narrow a union on a boolean-literal discriminant: every
 * `if (!result.success)` branch still saw the success shape, so reading the error
 * code inside it was a type error. A string discriminant narrows in both modes.
 */
export type ResendOtpResult =
  | { status: "sent"; message: string }
  | {
      status: "error";
      code: "MISSING_EMAIL" | "NOT_FOUND" | "RATE_LIMITED" | "MAIL_FAILED" | "UNKNOWN";
      message: string;
    };

const resendOTP = async (email: string): Promise<ResendOtpResult> => {
    const normalized = (email ?? "").trim().toLowerCase();

    if (!normalized) {
        return { status: "error", code: "MISSING_EMAIL", message: "Email is required." };
    }

    // Unbounded, this mails an arbitrary address on demand and refreshes the OTP —
    // which also resets the attempt budget on the verify side.
    const limit = await consumeRateLimit(db, {
        scope: "register:resend",
        subject: normalized,
        limit: 5,
        windowSeconds: 5 * 60,
    });

    if (!limit.allowed) {
        logger.warn("register.resend_rate_limited", { source: "auth", route: "resendOtp" });
        return {
            status: "error",
            code: "RATE_LIMITED",
            message: `Too many requests. Please try again in ${Math.ceil(
                limit.retryAfterSeconds / 60,
            )} minute(s).`,
        };
    }

    try {
        const pendingUser = await db.pendingUser.findUnique({
            where: { email: normalized },
        });

        if (!pendingUser) {
            return {
                status: "error",
                code: "NOT_FOUND",
                message: "Registration not found. Please register again.",
            };
        }

        const newOtp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

        await db.pendingUser.update({
            where: { email: normalized },
            data: {
                otp: newOtp,
                otpExpiresAt: otpExpiresAt,
                // A newly issued code starts with a clean attempt budget and clears
                // any lockout from the previous one.
                otpAttempts: 0,
                otpLockedUntil: null,
            },
        });

        const emailBody = {
            subject: "Verification OTP - SheWellCare",
            to: [normalized],
            html: `<p>Hi <strong>${pendingUser.name}</strong>,</p>
      <p>Your verification OTP is: <strong style="font-size: 24px; letter-spacing: 4px;">${newOtp}</strong></p>
      <p>This OTP is valid for 5 minutes.</p>`,
            text: `Hi ${pendingUser.name}, your SheWellCare verification OTP is ${newOtp}. It is valid for 5 minutes.`,
        };

        // A mail-provider failure must not become an unhandled 500. The new OTP has
        // already been written at this point, so failing loudly here would leave the
        // user with no valid code and an error page.
        try {
            await sendEmail(emailBody);
        } catch (mailError) {
            logger.error("otp.resend_mail_failed", {
                source: "auth",
                route: "resendOTP",
                error: mailError,
            });

            // Dev only — never log a credential in production.
            if (process.env.NODE_ENV !== "production") {
                console.warn(
                    `[dev] Email delivery failed. Registration OTP for ${normalized}: ${newOtp}`,
                );
                return { status: "sent", message: "OTP resent successfully" };
            }

            return {
                status: "error",
                code: "MAIL_FAILED",
                message: "We could not send your code right now. Please try again in a moment.",
            };
        }

        return { status: "sent", message: "OTP resent successfully" };
    } catch (error) {
        logger.error("register.resend_failed", { source: "auth", route: "resendOTP", error });
        return {
            status: "error",
            code: "UNKNOWN",
            message: "Failed to resend OTP. Please try again.",
        };
    }
};

export default resendOTP;
