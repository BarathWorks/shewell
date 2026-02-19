"use server";
import { db } from "~/server/db";
import { generateOtp } from "~/lib/utils";
import { sendEmail } from "@repo/mail";

const resendOTP = async (email: string) => {
    if (!email) {
        throw new Error("Email is required");
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

        await sendEmail(emailBodySendGrid);

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
