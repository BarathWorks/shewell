"use server";
import { db } from "~/server/db";

const verifyLoginOtp = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) => {
  if (!email || !otp) {
    throw new Error("Email and OTP are required");
  }

  try {
    const user = await db.user.findFirst({
      where: {
        email,
        verifiedAt: { not: null },
      },
      select: {
        id: true,
        otp: true,
        otpCreatedAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Check OTP match
    if (user.otp !== otp) {
      throw new Error("Invalid OTP");
    }

    // Check OTP expiry (5 minutes)
    if (user.otpCreatedAt) {
      const otpAge = Date.now() - new Date(user.otpCreatedAt).getTime();
      const FIVE_MINUTES = 5 * 60 * 1000;
      if (otpAge > FIVE_MINUTES) {
        throw new Error("OTP has expired. Please request a new one.");
      }
    } else {
      throw new Error("OTP has expired. Please request a new one.");
    }

    return {
      message: "OTP verified successfully",
      verified: true,
    };
  } catch (error) {
    console.log("verify-login-otp-error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("OTP verification failed");
  }
};

export default verifyLoginOtp;
