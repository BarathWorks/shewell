// app/api/google-meet-auth/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { env } from "~/env";
import { getServerAuthSession } from "~/server/auth";
import { createOAuthState } from "~/lib/oauth-state";

/**
 * Starts the Google Calendar connect flow for the signed-in practitioner.
 *
 * Two things were missing.
 *
 * **A `state` parameter.** Without one the callback cannot tell a flow this server
 * started from one an attacker started, which is what allows an attacker's Google
 * account to be bound to a practitioner's profile.
 *
 * **A session check.** This endpoint was open, so anyone could mint an
 * authorization URL. Requiring a session here is also what lets the state be bound
 * to a specific practitioner.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerAuthSession();

  // Absolute URLs throughout: `NextResponse.redirect` requires one, and the
  // previous relative `"/"` and `"/auth/login"` threw a TypeError instead of
  // redirecting.
  if (!session?.user?.id) {
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/auth/login`);
  }

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/google-meet-auth/callback`,
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/calendar.events",
    ],
    // Signed, expiring, and bound to this practitioner. Verified on the way back.
    state: createOAuthState(session.user.id),
  });

  return NextResponse.redirect(url);
}
