import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { getServerSession, type DefaultSession, type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';
// import { env } from "../env";
import { db } from './db';

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
      // ...other properties
      // role: UserRole;
    } & DefaultSession['user'];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/login'
  },
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  adapter: PrismaAdapter(db),
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
        // Add logic here to look up the user from the credentials supplied
        const user = await db.adminUser.findFirst({
          where: {
            email: credentials.username,
            active: true
          },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true
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

        return {
          id: user.id,
          email: user.email,
          name: user.name,
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
