"use server";
import { db } from "~/server/db";
import { hash } from "bcrypt";

interface IAccountSetupProps {
  userName: string;
  email: string;
  password: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

const AccountSetupUserAction = async ({
  userName,
  email,
  password,
}: IAccountSetupProps): Promise<ActionResult> => {
  const existingUser = await db.professionalUser.findFirst({
    where: {
      email: email,
    },
  });
  if (existingUser) {
    return { success: false, error: "User already exists" };
  }

  const sameUserName = await db.professionalUser.findFirst({
    where: {
      userName: userName,
    },
  });
  if (sameUserName) {
    return { success: false, error: "This Username already exists" };
  }

  const passwordHash = await hash(password, 10);
  const lowercaseEmail = email.toLowerCase();
  try {
    await db.professionalUser.create({
      data: {
        email: lowercaseEmail,
        userName: userName,
        passwordHash: passwordHash,
      },
    });

    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (error) {
    console.error("Failed SignUp", error);
    return { success: false, error: "Failed SignUp" };
  }
};

export default AccountSetupUserAction;
