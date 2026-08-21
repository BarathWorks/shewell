import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { getServerSession, type DefaultSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
// import { env } from "../env";
import { db } from './db';
import { authCookies } from '../lib/auth-cookies';
import { consumeRateLimit, resetRateLimit } from '@repo/database';
import type { PrismaClient } from '@repo/database';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      /**
       * For UI only — to hide controls a role cannot use.
       * Never authorize on this: it is baked into a 30-day JWT and goes stale.
       * Server-side checks resolve the role from the database (see `authz.ts`).
       */
      role?: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  cookies: authCookies,
  pages: {
    signIn: '/auth/login'
  },
  // CredentialsProvider forces the JWT strategy even with an adapter present.
  // Stated explicitly so the callbacks below obviously match the strategy in use.
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    // The id has to be carried on the token: under the JWT strategy the `session`
    // callback receives no `user`, so reading `user.id` there threw and NextAuth
    // returned an empty session for every signed-in admin.
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        role: token.role as string | undefined
      }
    })
  },
  adapter: // `db` is an extended client: `$extends` strips `$on`/`$use` from the type,
  // though every model delegate the adapter uses is still present at runtime.
  PrismaAdapter(db as unknown as PrismaClient),
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: {
          label: 'Email',
          type: 'text',
          placeholder: 'jane@appleseed.com'
        },
        password: { label: 'Password', type: 'password' }
      },
      // TODO: Remove ts-ignore
      // @ts-ignore
      async authorize(credentials, req) {
        if (!credentials) {
          return null;
        }

        // Password guessing against the admin panel was unbounded. This is the
        // account that approves practitioners, reads patient records and initiates
        // payouts, so it gets a tighter budget than the consumer apps.
        const attempt = await consumeRateLimit(db, {
          scope: 'login:admin',
          subject: credentials.username,
          limit: 5,
          windowSeconds: 15 * 60
        });
        if (!attempt.allowed) {
          throw new Error('Too many sign-in attempts. Please try again shortly.');
        }

        // Emails are stored lowercase by the seed script and the reset flow; match
        // case-insensitively so an address typed with different casing still works.
        const user = await db.adminUser.findFirst({
          where: {
            email: { equals: credentials.username, mode: 'insensitive' },
            active: true
          },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true
          }
        });

        if (!user) {
          return null;
        }

        if (!user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        await resetRateLimit(db, 'login:admin', credentials.username);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: ''
        };
      }
    })
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ]
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);

export const authHandler = NextAuth(authOptions);
