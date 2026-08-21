// app/api/google-meet-auth/callback/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { db } from "~/server/db";
import { revalidatePath } from "next/cache";
import { env } from "~/env";
import { getServerAuthSession } from "~/server/auth";
import { verifyOAuthState } from "~/lib/oauth-state";
import { logger } from "@repo/observability";

/**
 * Completes the Google Calendar connect flow.
 *
 * Three fixes here.
 *
 * **The `state` is now verified** against the signed-in practitioner. Without it,
 * a practitioner could be induced to load this URL carrying an attacker's `code`,
 * binding the attacker's Google account to their profile — so every consultation
 * afterwards created its calendar event and Meet link in the attacker's calendar.
 *
 * **The authorization code is no longer logged.** `console.log("code", code)` wrote
 * a live OAuth credential into the platform log on every connect. This app does not
 * strip console statements in production, so it stayed there.
 *
 * **Redirects are absolute.** `NextResponse.redirect("/")` throws `TypeError:
 * Invalid URL` rather than redirecting, so both early-exit paths returned a 500.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/auth/login`);
  }

  const professionalUserId = session.user.id;

  // Google reports user-side refusal as `error=access_denied` with no code.
  if (!code) {
    logger.info("google.oauth_no_code", {
      source: "google-meet-auth",
      reason: searchParams.get("error") ?? "missing_code",
    });
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/doctor-profile`);
  }

  // The CSRF check. Bound to this practitioner and to a ten-minute window.
  if (!verifyOAuthState(state, professionalUserId)) {
    logger.warn("google.oauth_bad_state", {
      source: "google-meet-auth",
      userId: professionalUserId,
      hasState: Boolean(state),
    });
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/doctor-profile`);
  }

  const oauth2Client = new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/google-meet-auth/callback`,
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    // Scoped by id from the session, not resolved by email from the request.
    const updated = await db.professionalUser.updateMany({
      where: { id: professionalUserId, deletedAt: null },
      data: {
        googleAccessToken: tokens.access_token,
        // Google only returns a refresh token on the first consent; `prompt:
        // "consent"` forces one, but never overwrite a stored token with null.
        ...(tokens.refresh_token
          ? { googleRefreshToken: tokens.refresh_token }
          : {}),
      },
    });

    if (updated.count === 0) {
      logger.warn("google.oauth_no_account", {
        source: "google-meet-auth",
        userId: professionalUserId,
      });
      return NextResponse.redirect(`${env.NEXTAUTH_URL}/auth/login`);
    }

    logger.info("google.oauth_connected", {
      source: "google-meet-auth",
      userId: professionalUserId,
      receivedRefreshToken: Boolean(tokens.refresh_token),
    });

    revalidatePath("/doctor-profile");

    return NextResponse.redirect(`${env.NEXTAUTH_URL}/doctor-profile`);
  } catch (error) {
    // The error object can carry the exchanged tokens; the redaction layer in
    // `@repo/observability` strips them by key.
    logger.error("google.oauth_exchange_failed", {
      source: "google-meet-auth",
      userId: professionalUserId,
      error,
    });
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/doctor-profile`);
  }
}
