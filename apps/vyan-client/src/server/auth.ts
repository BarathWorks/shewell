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
import { authCookies } from "~/lib/auth-cookies";
import crypto from "crypto";
import { consumeRateLimit, resetRateLimit } from "@repo/database";
import type { PrismaClient } from "@repo/database";

/** Attempts allowed against one account before the code is burned. */
const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MINUTES = 5;
const OTP_VALIDITY_MS = 5 * 60 * 1000;

/** Constant-time compare; rejects an empty stored code outright. */
function otpMatches(expected: string | null | undefined, received: string | null | undefined) {
  if (!expected || !received) return false;
  const a = Buffer.from(String(expected), "utf8");
  const b = Buffer.from(String(received), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

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
      verifiedAt?: Date | null;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    verifiedAt?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    verifiedAt?: Date | null;
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
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    jwt: async ({ token, user }) => {
      // Cache user data in JWT to avoid DB lookups on every request
      if (user) {
        token.id = user.id;
        token.verifiedAt = user.verifiedAt;
      }
      return token;
    },
    session: async ({ session, token }) => {
      // Use cached data from JWT instead of querying DB every time
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.verifiedAt = token.verifiedAt;
      }
      return session;
    },
  },

  adapter: // `db` is an extended client: `$extends` strips `$on`/`$use` from the type,
  // though every model delegate the adapter uses is still present at runtime.
  PrismaAdapter(db as unknown as PrismaClient),
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

        // Password guessing was previously unbounded against this endpoint.
        const attempt = await consumeRateLimit(db, {
          scope: "login:password",
          subject: credentials.email,
          limit: 10,
          windowSeconds: 5 * 60,
        });
        if (!attempt.allowed) {
          throw new Error("Too many sign-in attempts. Please try again shortly.");
        }

        // PERFORMANCE: Run both queries in parallel instead of sequentially
        const [isDoctorAccount, user] = await Promise.all([
          db.professionalUser.findFirst({
            where: { email: credentials.email },
            select: { id: true },
          }),
          db.user.findFirst({
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
          }),
        ]);

        if (isDoctorAccount) {
          throw new Error(
            "Doctor accounts cannot access this portal. Please use the professional portal.",
          );
        }

        if (!user) {
          throw new Error("User not found");
        }

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        await resetRateLimit(db, "login:password", credentials.email);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          verifiedAt: user.verifiedAt,
        };
      },
    }),

    // OTP-based login provider
    CredentialsProvider({
      id: "OtpVyanClient",
      name: "OtpVyanClient",
      credentials: {
        email: {
          label: "Email*",
          type: "email",
          placeholder: "Enter your email id",
        },
        otp: {
          label: "OTP*",
          type: "text",
          placeholder: "Enter the OTP",
        },
      },

      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        // A six-digit code is 1e6 possibilities; unbounded, it is guessable well
        // inside its five-minute life. This is the real sign-in path, so the limit
        // has to live here and not only in the pre-check action.
        const attempt = await consumeRateLimit(db, {
          scope: "login:otp",
          subject: credentials.email,
          limit: 20,
          windowSeconds: 5 * 60,
        });
        if (!attempt.allowed) {
          throw new Error("Too many attempts. Please request a new OTP later.");
        }

        // PERFORMANCE: Run both queries in parallel instead of sequentially
        const [isDoctorAccount, user] = await Promise.all([
          db.professionalUser.findFirst({
            where: { email: credentials.email },
            select: { id: true },
          }),
          db.user.findFirst({
            select: {
              id: true,
              email: true,
              phoneNumber: true,
              verifiedAt: true,
              name: true,
              otp: true,
              otpCreatedAt: true,
              otpAttempts: true,
              otpLockedUntil: true,
            },
            where: {
              email: credentials.email,
              verifiedAt: { not: null },
            },
          }),
        ]);

        if (isDoctorAccount) {
          throw new Error(
            "Doctor accounts cannot access this portal. Please use the professional portal.",
          );
        }

        if (!user) {
          throw new Error("User not found");
        }

        if (user.otpLockedUntil && user.otpLockedUntil > new Date()) {
          const minutes = Math.ceil((user.otpLockedUntil.getTime() - Date.now()) / 60000);
          throw new Error(
            `Too many incorrect attempts. Please try again in ${minutes} minute(s).`,
          );
        }

        // Expiry first: a cleared code has `otpCreatedAt = null` and must not be
        // treated as a wrong guess.
        const issuedAt = user.otpCreatedAt ? new Date(user.otpCreatedAt).getTime() : 0;
        if (!issuedAt || Date.now() - issuedAt > OTP_VALIDITY_MS) {
          throw new Error("OTP has expired. Please request a new one.");
        }

        // Constant-time, and an empty stored code never matches — a plain `!==`
        // would accept an empty submission against a cleared code.
        if (!otpMatches(user.otp, credentials.otp)) {
          const attempts = user.otpAttempts + 1;
          const exhausted = attempts >= MAX_OTP_ATTEMPTS;

          await db.user.update({
            where: { id: user.id },
            data: {
              otpAttempts: attempts,
              // Burn the code as well as locking out; otherwise it stays guessable
              // once the lockout expires.
              ...(exhausted
                ? {
                    otpLockedUntil: new Date(Date.now() + OTP_LOCKOUT_MINUTES * 60 * 1000),
                    otp: "",
                    otpCreatedAt: null,
                  }
                : {}),
            },
          });

          throw new Error(
            exhausted
              ? `Too many incorrect attempts. Please request a new OTP in ${OTP_LOCKOUT_MINUTES} minutes.`
              : "Invalid OTP",
          );
        }

        // Single use: clear the code and the counters.
        await db.user.update({
          where: { id: user.id },
          data: { otp: "", otpCreatedAt: null, otpAttempts: 0, otpLockedUntil: null },
        });

        await resetRateLimit(db, "login:otp", credentials.email);
        await resetRateLimit(db, "otp:send", credentials.email);

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
