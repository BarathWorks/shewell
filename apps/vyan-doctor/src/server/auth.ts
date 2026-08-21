import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  DefaultUser,
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";

import { env } from "~/env";
import { db } from "./db";
// import { ReceiptText } from "lucide-react";
import Email from "next-auth/providers/email";
import { compare } from "bcrypt";
import { authCookies } from "~/lib/auth-cookies";
import { consumeRateLimit, resetRateLimit } from "@repo/database";
import type { PrismaClient } from "@repo/database";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  cookies: authCookies,
  pages: {
    signIn: "/auth/login",
   
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    session: async ({ session, user }) => {
      const userAuth = await db.professionalUser.findFirst({
        where: {
          email: {
            equals: session.user.email as string,
            mode: "insensitive",
          },
          deletedAt : null
          
        },
      });
      if (session.user && userAuth) {
        session.user.id = userAuth.id;
      }
      return { ...session };
    },
  },

  adapter: // `db` is an extended client: `$extends` strips `$on`/`$use` from the type,
  // though every model delegate the adapter uses is still present at runtime.
  PrismaAdapter(db as unknown as PrismaClient),
  providers: [
    CredentialsProvider({
      id: "CredentialsVyanDoctor",
      name: "CredentialsVyanDoctor",
      credentials: {
        email: {
          label: "Email*",
          type: "email",
          placeholder: "Enter your email id",
        },
        password: {
          label: "Password*",
          type: "password",
          placeholder: "Enter your password",
        },
      },

      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        // Password guessing against this portal was completely unbounded. The
        // client app already limits to 10 attempts per 15 minutes and the admin
        // panel to 5; this endpoint — which fronts the accounts holding patient
        // records, identity documents and bank details — had no limit at all.
        //
        // Each attempt also runs a bcrypt comparison, so an unbounded endpoint is a
        // cheap way to burn server CPU as well as a way in.
        const attempt = await consumeRateLimit(db, {
          scope: "login:doctor",
          subject: credentials.email,
          limit: 10,
          windowSeconds: 15 * 60,
        });

        if (!attempt.allowed) {
          throw new Error(
            "Too many sign-in attempts. Please try again shortly.",
          );
        }

        const professionalUser = await db.professionalUser.findFirst({
          select: {
            id: true,
            email: true,
            passwordHash: true,
          },
          where: {
            // Matched case-insensitively, as the session callback and the admin
            // portal already do. Addresses are stored lowercase at registration, so
            // a differently-cased sign-in previously failed for no visible reason.
            email: { equals: credentials.email, mode: "insensitive" },
            deletedAt: null,
          },
        });

        if (!professionalUser) {
          return null;
        }
        if (!professionalUser.passwordHash) {
          return null;
        }

        const isValid = await compare(
          credentials.password,
          professionalUser.passwordHash,
        );
        if (!isValid) {
          return null;
        }

        // Clear the budget on success, so a legitimate practitioner who mistyped a
        // few times is not still counted against.
        await resetRateLimit(db, "login:doctor", credentials.email);

        return {
          id: professionalUser.id + "",
          email: professionalUser.email,
        };
      },
    }),
    // DiscordProvider({
    //   clientId: env.DISCORD_CLIENT_ID,
    //   clientSecret: env.DISCORD_CLIENT_SECRET,
    // }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
