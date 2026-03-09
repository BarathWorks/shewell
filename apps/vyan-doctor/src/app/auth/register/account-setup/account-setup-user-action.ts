"use server";
import { db } from "~/server/db";
import { hash } from "bcrypt";

interface IAccountSetupProps {
  userName: string;
  email: string;
  password: string;
}

const AccountSetupUserAction = async ({
  userName,
  email,
  password,
}: IAccountSetupProps) => {
  const existingUser = await db.professionalUser.findFirst({
    where: {
      email: email,
    },
  });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const sameUserName = await db.professionalUser.findFirst({
    where: {
      userName: userName,
    },
  });
  if (sameUserName) {
    throw new Error("This Username already exists");
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
      message: "Account created successfully",
    };
  } catch (error) {
    console.error("Failed SignUp", error);
    throw new Error("Failed SignUp");
  }
};

export default AccountSetupUserAction;
