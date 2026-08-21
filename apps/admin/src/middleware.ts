import { withAuth } from 'next-auth/middleware';
import { SESSION_COOKIE_NAME } from './lib/auth-cookies';

/**
 * The cookie name must match the one in `authOptions`, otherwise middleware looks
 * for a token that is never there and redirects signed-in users to login.
 */
export default withAuth({
  pages: { signIn: '/auth/login' },
  cookies: {
    sessionToken: { name: SESSION_COOKIE_NAME }
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|auth|demo|layout|themes).*)']
};
