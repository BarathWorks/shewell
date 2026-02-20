// import { google } from 'googleapis';
// import { NextApiRequest, NextApiResponse } from 'next';
// import { getServerSession } from 'next-auth';
// import { getSession } from 'next-auth/react';
// import { db } from '~/server/db';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//     const { code } = req.query;

//     const oauth2Client = new google.auth.OAuth2(
//         process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
//         process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
//         `${process.env.NEXTAUTH_URL}/api/google-meet-auth`
//     );

//     const { tokens } = await oauth2Client.getToken(code as string);
//     //   const session = await getSession({ req });
//     const session = await getServerSession()

//     const professionalUser = await db.professionalUser.findFirst({
//         where: {
//             email: session?.user.email
//         }
//     })

//     // Save tokens to the session or database (as per your needs)
//     //   session.user.googleAccessToken = tokens.access_token;
//     //   session.user.googleRefreshToken = tokens.refresh_token;

//     await db.professionalUser.create({
//         data: {
//             googleAccessToken: tokens.access_token,
//             googleRefreshToken: tokens.refresh_token,
//             id: professionalUser?.id
//         }
//     })

//     res.redirect('/dashboard'); // Redirect the user after successful OAuth
// }

// app/api/google-meet-auth/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getServerSession } from "next-auth";
import { db } from "~/server/db";

import { revalidatePath } from "next/cache";
import { env } from "~/env";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  console.log("code", code);

  if (!code) {
    return NextResponse.redirect("/");
  }

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/google-meet-auth/callback`,
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    const session = await getServerSession();

    if (!session) {
      return NextResponse.redirect("/auth/login");
    }
    if (!session.user.email) {
      return NextResponse.redirect("/auth/login");
    }

    const professionalUser = await db.professionalUser.findFirst({
      where: {
        email: session.user.email,
      },
    });

    if (!professionalUser) {
      return NextResponse.redirect("/auth/login");
    }

    await db.professionalUser.update({
      where: {
        id: professionalUser?.id,
      },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      },
    });
    revalidatePath(`${env.NEXTAUTH_URL}/doctor-profile`);

    return NextResponse.redirect(`${env.NEXTAUTH_URL}/doctor-profile`);
  } catch (error) {
    console.error("Error retrieving tokens", error);
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/`);
  }
}
