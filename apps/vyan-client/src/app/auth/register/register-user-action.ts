"use server";
import { db } from "~/server/db";
import { hash } from "bcrypt";
import { generateOtp } from "~/lib/utils";
import { sendEmail } from "@repo/mail";

export interface ISignUpFields {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  age: boolean;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

const RegisterUserAction = async ({
  name,
  email,
  password,
  phoneNumber,
  age,
}: ISignUpFields): Promise<ActionResult> => {
  // Check if a verified user already exists
  const existingVerifiedUser = await db.user.findFirst({
    where: {
      email: email,
      verifiedAt: { not: null },
    },
  });

  if (existingVerifiedUser) {
    return { success: false, error: "User already exists please login" };
  }

  const passwordHash = await hash(password, 10);
  const otp = generateOtp();
  const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes

  try {
    // Use upsert to create or update PendingUser
    const pendingUser = await db.pendingUser.upsert({
      where: { email: email },
      update: {
        name: name,
        passwordHash: passwordHash,
        phoneNumber: phoneNumber,
        ageGreaterThan18: age,
        otp: otp,
        otpExpiresAt: otpExpiresAt,
      },
      create: {
        name: name,
        email: email,
        passwordHash: passwordHash,
        phoneNumber: phoneNumber,
        ageGreaterThan18: age,
        otp: otp,
        otpExpiresAt: otpExpiresAt,
      },
    });

    const emailBodySendGrid = {
      from: process.env.FROM_EMAIL!,
      subject: "Verification OTP",
      to: [pendingUser.email],
      html: `<p>Hi,<strong> ${pendingUser.name} <br/> </strong/></p>
      <span>This is your verification OTP ${otp}<span/>
      `,
    };

    await sendEmail(emailBodySendGrid);

    return {
      success: true,
      message: "OTP sent to your email",
    };
  } catch (error) {
    console.error("Failed SignUp", error);
    return { success: false, error: "Failed Signup" };
  }
};

export default RegisterUserAction;
