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
import { ReceiptText } from "lucide-react";
import Email from "next-auth/providers/email";
import { compare } from "bcrypt";
import router from "next/router";

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

  interface User extends DefaultUser {
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
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user }) => {
      // Cache user ID in JWT to avoid DB lookups on every request
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Use cached ID from JWT instead of querying DB every time
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      id: "CrendentialsVyanClient",
      name: "CrendentialsVyanClient",
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

        // CRITICAL FIX: Check if email belongs to a doctor account
        // This prevents doctor accounts from accessing client app
        const isDoctorAccount = await db.professionalUser.findFirst({
          where: { email: credentials.email },
          select: { id: true },
        });

        if (isDoctorAccount) {
          throw new Error(
            "Doctor accounts cannot access this portal. Please use the professional portal."
          );
        }

        const user = await db.user.findFirst({
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            passwordHash: true,
            verifiedAt: true,
            name: true,
          },
          where: {
            email: credentials.email,
            verifiedAt: {
              not: null,
            },
          },
        });

        if(!user){
          throw new Error(
            "User not found"
          );
        }

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          verifiedAt: user.verifiedAt,
        };
      },

    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
