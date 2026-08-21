/**
 * Per-app NextAuth cookie names.
 *
 * All three apps previously used NextAuth's default `next-auth.session-token`.
 * Browsers scope cookies by host and ignore the port, so on localhost the client
 * (3001), doctor (3002) and admin (3004) apps all read and overwrite each other's
 * session — which is what made a patient show up signed in as a practitioner.
 *
 * Kept in its own module with no imports so `middleware.ts` (edge runtime) can use
 * it without pulling in Prisma.
 */
const useSecureCookies = process.env.NODE_ENV === "production";
const securePrefix = useSecureCookies ? "__Secure-" : "";
const hostPrefix = useSecureCookies ? "__Host-" : "";

export const SESSION_COOKIE_NAME = `${securePrefix}shewell-client.session-token`;
export const CALLBACK_COOKIE_NAME = `${securePrefix}shewell-client.callback-url`;
export const CSRF_COOKIE_NAME = `${hostPrefix}shewell-client.csrf-token`;

export const authCookies = {
  sessionToken: {
    name: SESSION_COOKIE_NAME,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: useSecureCookies,
    },
  },
  callbackUrl: {
    name: CALLBACK_COOKIE_NAME,
    options: {
      sameSite: "lax",
      path: "/",
      secure: useSecureCookies,
    },
  },
  csrfToken: {
    name: CSRF_COOKIE_NAME,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: useSecureCookies,
    },
  },
} as const;
