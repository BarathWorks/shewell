"use server";
import { db } from "~/server/db";
import { generateOtp } from "~/lib/utils";
import { sendEmail } from "@repo/mail";

const sendLoginOtp = async (email: string) => {
  if (!email) {
    throw new Error("Email is required");
  }

  try {
    // Check if email belongs to a doctor account
    const isDoctorAccount = await db.professionalUser.findFirst({
      where: { email },
      select: { id: true },
    });

    if (isDoctorAccount) {
      throw new Error(
        "Doctor accounts cannot access this portal. Please use the professional portal.",
      );
    }

    // Find the verified user
    const user = await db.user.findFirst({
      where: {
        email,
        verifiedAt: { not: null },
      },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new Error(
        "No account found with this email. Please register first.",
      );
    }

    // Generate OTP and save to user
    const otp = generateOtp();
    const otpCreatedAt = new Date();

    await db.user.update({
      where: { email },
      data: {
        otp,
        otpCreatedAt,
      },
    });

    // Send OTP email
    const emailBody = {
      from: process.env.FROM_EMAIL!,
      subject: "Login OTP - SheWellCare",
      to: [email],
      html: `<p>Hi <strong>${user.name}</strong>,</p>
      <p>Your login OTP is: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
      <p>This OTP is valid for 5 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>`,
    };

    await sendEmail(emailBody);

    return {
      message: "OTP sent successfully",
      email: user.email,
    };
  } catch (error) {
    console.log("send-login-otp-error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to send OTP");
  }
};

export default sendLoginOtp;
