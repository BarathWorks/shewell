"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getServerAuthSession } from "../../../server/auth";
import { db } from "../../../server/db";
import { sendEmail } from "@repo/mail";

import { signOut } from "next-auth/react";
import { IEmailChangeForm } from "./email-change-form";

type IUser = {
  name: string;
  email: string;
  phoneNumber: string;
};
  //generate random otp
  function generateOTP(limit:number) {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < limit; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}
const UpdatePersonalInfo = async (data: IUser) => {
  const session = await getServerAuthSession();

  if (!session) {
    return {
      error: "Unauthorized",
    };
  }
  
  const { name, email, phoneNumber } = data;

  const FormData = z.object({
    name: z.string(),
    email: z.string(),
    phoneNumber: z.string(),
  });

  const isValidData = FormData.parse({
    name,
    email,
    phoneNumber,
  });
  if (!isValidData) {
    return {
      error: "Invalid data",
    };
  }

  await db.user.update({
    where: {
      id: session.user.id + "",
    },
    data: {
     name: name,
      email: email,
      phoneNumber: phoneNumber,
    },
  });
  revalidatePath("/profile/edit-profile");
  return {
    message: "Personal Information updated Successfully",
  };
};

export const emailChange=async()=>{
  const session = await getServerAuthSession();

  //finding the logged in user
  const user=await db.user.findUnique({
    where:{
      email:session?.user.email!
    }
  })

if(!user)
{
  return{
    error:"Unauthorized"
  }
}
//if user exists then generating the random otp
const otp = generateOTP(6);
console.log("otp is",otp);

//setting the otp in the database
await db.user.update({
  where:{
    email:session?.user.email!
  },
  data:{
    otp:otp,
    otpCreatedAt:new Date()
  }
})

const emailBodySendGrid = {
  from: process.env.FROM_EMAIL!,
  subject: "Reset email-id instructions!",
  to: [user.email],
  html: `<p>Hi,<strong> ${user.name}</strong><br/></p>
         <span>Here is the otp to reset your email.</span><br/>
         <p><strong>${otp}</strong></p>
         <p>This is valid for next 4 hours.</p>
         <strong>Team Nature Hunt!</strong>`,
};

try{
  await sendEmail(emailBodySendGrid);
  revalidatePath('/profile/edit-profile');
  return{
    message:"Email sent successfully"
  }
}
catch(err)
{
  return{
    error:"Error in sending the email"
  }
}
  
}

export const verifyOTP = async (data: IEmailChangeForm) => {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    return {
      error: "Unauthorized",
    };
  }

  // finding the logged in user
  const userDetails = await db.user.findUnique({
    where: {
      email: session.user.email!,
    },
  });

  if (!userDetails) {
    return { error: "User not found." };
  }

  // check if OTP is expired (15 minutes expiration window)
  if (!userDetails.otpCreatedAt || !userDetails.otp) {
    return { error: "No active OTP request found. Please request a new OTP." };
  }

  const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
  const isExpired = Date.now() - new Date(userDetails.otpCreatedAt).getTime() > FIFTEEN_MINUTES_MS;
  if (isExpired) {
    return { error: "OTP has expired. Please request a new OTP." };
  }

  // whether the new email already exists
  const existingUser = await db.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser && existingUser.id !== userDetails.id) {
    return {
      error: "Email already exists. Please try another email address.",
    };
  }

  const isCorrectOtp = data.otp.trim() === userDetails.otp.trim();

  if (isCorrectOtp) {
    try {
      await db.user.update({
        data: {
          email: data.email,
          otp: "",
        },
        where: {
          id: userDetails.id,
        },
      });
      revalidatePath("/profile/edit-profile");
      return {
        message: "Email changed successfully.",
      };
    } catch (err) {
      return {
        error: "Error in changing email. Please try again.",
      };
    }
  }

  return {
    error: "OTP doesn't match. Please check and try again.",
  };
};

export default UpdatePersonalInfo;
