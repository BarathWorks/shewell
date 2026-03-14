"use server";
import { db } from "~/server/db";
import { hash } from "bcrypt";
import { signIn } from "next-auth/react";

interface IPersInfoProps {
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  email: string;
  password: string;
  dob: Date;
  userName: string;
}

export type ActionResult =
  | { success: true; message: string }
  | { success: false; error: string };

const PersInfoUserAction = async ({
  firstName,
  lastName,
  phoneNumber,
  email,
  password,
  dob,
  userName,
}: IPersInfoProps): Promise<ActionResult> => {
  const user = await db.professionalUser.findFirst({
    where: {
      email: email,
    },
  });
  if (user) {
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
    const newUser = await db.professionalUser.create({
      data: {
        firstName: firstName,
        lastName: lastName,
        phoneNumber: phoneNumber,
        passwordHash: passwordHash,
        email: lowercaseEmail,
        dob: dob,
        userName: userName,
      },
    });

    return {
      success: true,
      message: "Successfully added the Personal Information",
    };
  } catch (error) {
    console.error("Failed SignUp", error);
    return { success: false, error: "Failed SignUp" };
  }
};

export default PersInfoUserAction;
