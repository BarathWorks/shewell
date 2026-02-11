"use server";
import { db } from "~/server/db";
import { hash } from "bcrypt";

const verifyOtpAction = async ({
  otp,
  email,
}: {
  otp: string;
  email: string;
}) => {
  if (!email) {
    throw new Error("Email is required for verification");
  }

  try {
    // Find the pending user
    const pendingUser = await db.pendingUser.findUnique({
      where: { email: email },
    });

    if (!pendingUser) {
      throw new Error("Registration not found. Please register again.");
    }

    // Check if OTP has expired
    if (new Date() > pendingUser.otpExpiresAt) {
      throw new Error("OTP has expired. Please request a new one.");
    }

    // Verify OTP
    if (pendingUser.otp !== otp) {
      throw new Error("Invalid OTP");
    }

    // Create the actual user from pending user data
    const newUser = await db.user.create({
      data: {
        name: pendingUser.name,
        email: pendingUser.email,
        passwordHash: pendingUser.passwordHash,
        phoneNumber: pendingUser.phoneNumber,
        ageGreaterThan18: pendingUser.ageGreaterThan18,
        otp: pendingUser.otp,
        verifiedAt: new Date(),
      },
    });

    // Delete the pending user record
    await db.pendingUser.delete({
      where: { email: email },
    });

    console.log("Account verification successfully, User created:", newUser.id);
    return {
      message: "Your account has been verified",
      email: newUser.email,
    };
  } catch (error) {
    console.log("verification-error", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Your account has not been verified");
  }
};

export default verifyOtpAction;
