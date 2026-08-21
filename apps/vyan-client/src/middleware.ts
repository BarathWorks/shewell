import { withAuth } from "next-auth/middleware";
import { SESSION_COOKIE_NAME } from "~/lib/auth-cookies";

/**
 * Gates the signed-in areas of the client app. Everything else (marketing pages,
 * blogs, doctor profiles, the booking funnel) stays public by design.
 *
 * The cookie name must match the one in `authOptions`, otherwise middleware looks
 * for a token that is never there and redirects signed-in users to login.
 *
 * This is a first line of defence only — every server action and tRPC procedure
 * still has to check the session itself, because middleware does not run for
 * server action invocations on all deploy targets.
 */
export default withAuth({
  pages: { signIn: "/auth/login" },
  cookies: {
    sessionToken: { name: SESSION_COOKIE_NAME },
  },
});

export const config = {
  matcher: ["/profile/:path*"],
};
