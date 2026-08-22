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

const resetEmailBody = {
  subject: "Reset email-id instructions!",
  to: [user.email],
  html: `<p>Hi,<strong> ${user.name}</strong><br/></p>
         <span>Here is the otp to reset your email.</span><br/>
         <p><strong>${otp}</strong></p>
         <p>This is valid for next 4 hours.</p>
         <strong>Team SheWell</strong>`,
};

try{
  await sendEmail(resetEmailBody);
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

export const verifyOTP=async(data:IEmailChangeForm)=>{
  const session = await getServerAuthSession();

  //finding the logged in user
  const userDetails=await db.user.findUnique({
    where:{
      email:session?.user.email!
    }
  })

  
   //whether the email already exists
   const user=await db.user.findUnique({
    where:{
      email:data.email
    }
   })

   if(user)
   {
    return{
      error:"Email already exists . Please try another one"
    }
   }

   const isCorrectOtp=(data.otp === userDetails?.otp);

  if(isCorrectOtp)
  {
    try{
      await db.user.update({
        data:{
          email:data.email
        },
        where:{
         id:userDetails.id
        }
      })
      revalidatePath("/profile/edit-profile");
      return{
        message:"Email changed successfully" 
      }
    }
    catch(err)
    {
      return{
        message:"Error in changing email"
      }
    }
   
  }

  return{
    error:"Otp doesn't match"
  }


}

export default UpdatePersonalInfo;
