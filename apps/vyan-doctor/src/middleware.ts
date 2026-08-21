import { withAuth } from "next-auth/middleware";
import { SESSION_COOKIE_NAME } from "~/lib/auth-cookies";

/**
 * The cookie name must match the one in `authOptions`, otherwise middleware looks
 * for a token that is never there and redirects signed-in users to login.
 */
export default withAuth({
  pages: { signIn: "/auth/login" },
  cookies: {
    sessionToken: { name: SESSION_COOKIE_NAME },
  },
});

export const config = {
  // Prefix matchers (`:path*`). The previous list used exact paths, so
  // `/edit-profile` did not cover `/edit-profile/prices`, and several registration
  // steps were not listed at all. Those pages then ran their queries with no
  // session and returned a 500 instead of redirecting to login.
  matcher: [
    "/dashboard/:path*",
    "/appointment/:path*",
    "/edit-profile/:path*",
    "/doctor-profile/:path*",
    // Everything under /auth/register except the two pre-auth steps: a doctor
    // creating an account has no session yet, so gating those would lock signup out.
    "/auth/register/((?!account-setup|personal-information).*)",
  ],
};
