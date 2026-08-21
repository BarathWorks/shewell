"use server";
import { db } from "~/server/db";
import { generateOtp } from "~/lib/utils";
import { sendEmail } from "@repo/mail";
import { consumeRateLimit } from "@repo/database";
import { logger } from "@repo/observability";

const resendOTP = async (email: string) => {
    if (!email) {
        throw new Error("Email is required");
    }

    // Unbounded, this mails an arbitrary address on demand and refreshes the OTP —
    // which also resets the attempt budget on the verify side.
    const limit = await consumeRateLimit(db, {
        scope: "register:resend",
        subject: email.trim().toLowerCase(),
        limit: 5,
        windowSeconds: 5 * 60,
    });

    if (!limit.allowed) {
        logger.warn("register.resend_rate_limited", { source: "auth", route: "resendOtp" });
        throw new Error(
            `Too many requests. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`,
        );
    }

    try {
        // Find the pending user
        const pendingUser = await db.pendingUser.findUnique({
            where: { email: email },
        });

        if (!pendingUser) {
            throw new Error("Registration not found. Please register again.");
        }

        // Generate new OTP
        const newOtp = generateOtp();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

        // Update the pending user with new OTP
        await db.pendingUser.update({
            where: { email: email },
            data: {
                otp: newOtp,
                otpExpiresAt: otpExpiresAt,
                // A newly issued code starts with a clean attempt budget and clears
                // any lockout from the previous one.
                otpAttempts: 0,
                otpLockedUntil: null,
            },
        });

        // Send email
        const emailBodySendGrid = {
            from: process.env.FROM_EMAIL!,
            subject: "Verification OTP",
            to: [email],
            html: `<p>Hi,<strong> ${pendingUser.name} <br/> </strong/></p>
      <span>This is your verification OTP ${newOtp}<span/>
      `,
        };

        // Same guard as `sendLoginOtp`: a mail-provider failure must not become an
        // unhandled 500. The new OTP has already been written at this point, so
        // rethrowing leaves the user with no valid code and an error page.
        try {
            await sendEmail(emailBodySendGrid);
        } catch (mailError) {
            logger.error("otp.resend_mail_failed", {
                source: "auth",
                route: "resendOTP",
                error: mailError,
            });

            // Dev only — never log a credential in production.
            if (process.env.NODE_ENV !== "production") {
                console.warn(
                    `[dev] Email delivery failed. Registration OTP for ${email}: ${newOtp}`,
                );
                return { message: "OTP resent successfully" };
            }

            throw new Error(
                "We could not send your code right now. Please try again in a moment.",
            );
        }

        return {
            message: "OTP resent successfully",
        };
    } catch (error) {
        console.log("resend-otp-error:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to resend OTP");
    }
};

export default resendOTP;
