// import { google } from 'googleapis';
// import { NextApiRequest, NextApiResponse } from 'next';

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   const oauth2Client = new google.auth.OAuth2(
//     process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
//     process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
//     `${process.env.NEXTAUTH_URL}/api/google-meet-auth/callback`
//   );

//   const url = oauth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
//   });

//   res.redirect(url);
// }

// app/api/google-meet-auth/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { env } from '~/env';

export async function GET() {
  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/google-meet-auth/callback`
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar', 'https://www.googleapis.com/auth/calendar.events'],
  });

  return NextResponse.redirect(url);
}
