"use server";
import { db } from "~/server/db";
import { hash } from "bcrypt";
import { generateOtp } from "~/lib/utils";
import { sendEmail } from "@repo/mail";
import { z } from "zod";
import { consumeRateLimit } from "@repo/database";
import { logger } from "@repo/observability";

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
  // There was no server-side validation here at all — a one-character password was
  // accepted, and the email was never checked or normalised.
  const parsed = z
    .object({
      name: z.string().trim().min(1, "Name is required").max(120),
      email: z.string().trim().toLowerCase().email("Enter a valid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      phoneNumber: z.string().trim().min(6, "Enter a valid phone number").max(20),
      age: z.boolean(),
    })
    .safeParse({ name, email, password, phoneNumber, age });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Please check the details entered",
    };
  }

  ({ name, email, password, phoneNumber, age } = parsed.data);

  // Unbounded, this creates PendingUser rows and mails an arbitrary address on
  // demand.
  const limit = await consumeRateLimit(db, {
    scope: "register:signup",
    subject: email,
    limit: 5,
    windowSeconds: 5 * 60,
  });

  if (!limit.allowed) {
    logger.warn("register.signup_rate_limited", { source: "auth", route: "register" });
    return {
      success: false,
      error: `Too many attempts. Please try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minute(s).`,
    };
  }

  const [existingVerifiedUser, doctorAccount] = await Promise.all([
    db.user.findFirst({
      where: { email, verifiedAt: { not: null } },
      select: { id: true, deletedAt: true },
    }),
    // Sign-in refuses a practitioner address on this portal. Without the same check
    // here, a doctor could complete registration and then be turned away at login
    // with an account they can never use — and `email` is unique on User, so the
    // row would also block any later legitimate signup.
    db.professionalUser.findFirst({
      where: { email },
      select: { id: true },
    }),
  ]);

  if (doctorAccount) {
    return {
      success: false,
      error:
        "This email belongs to a practitioner account. Please sign in through the professional portal.",
    };
  }

  if (existingVerifiedUser?.deletedAt) {
    return {
      success: false,
      error: "This account has been closed. Please contact support to restore it.",
    };
  }

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

    const verificationEmail = {
      subject: "Verification OTP - SheWellCare",
      to: [pendingUser.email],
      html: `<p>Hi <strong>${pendingUser.name}</strong>,</p>
      <p>Your verification OTP is: <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>
      <p>This OTP is valid for 5 minutes.</p>`,
      text: `Hi ${pendingUser.name}, your SheWellCare verification OTP is ${otp}. It is valid for 5 minutes.`,
    };

    // The PendingUser above is already written by this point, so a mail-provider
    // failure must not be reported as "Failed Signup" — the account exists, and
    // telling the user otherwise sends them round the loop again (where the
    // upsert quietly rotates their OTP a second time).
    try {
      await sendEmail(verificationEmail);
    } catch (mailError) {
      logger.error("register.otp_mail_failed", {
        source: "auth",
        route: "RegisterUserAction",
        error: mailError,
      });

      // Dev only — an OTP in a production log is a credential in a log.
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[dev] Email delivery failed. Registration OTP for ${pendingUser.email}: ${otp}`,
        );
        return { success: true, message: "OTP sent to your email" };
      }

      return {
        success: false,
        error:
          "Your account was created, but we could not send the code. Please use “Resend OTP”.",
      };
    }

    return {
      success: true,
      message: "OTP sent to your email",
    };
  } catch (error) {
    logger.error("register.failed", {
      source: "auth",
      route: "RegisterUserAction",
      error,
    });
    return { success: false, error: "Failed Signup" };
  }
};

export default RegisterUserAction;
