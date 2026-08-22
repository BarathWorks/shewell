import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z
      .string()
      .url()
      .refine((str) => !str.includes('YOUR_POSTGRES_URL_HERE'), 'You forgot to change the default URL'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    NEXTAUTH_SECRET: process.env.NODE_ENV === 'production' ? z.string() : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // An explicitly configured NEXTAUTH_URL wins.
      //
      // This previously read `process.env.VERCEL_URL ?? str`, which prefers the
      // per-deployment Vercel hostname over the custom domain the site actually
      // runs on — so OAuth callbacks and the links built from NEXTAUTH_URL
      // (password resets, the Google connect redirect) pointed at a URL the user
      // never visits. VERCEL_URL is the fallback, not the override, and it carries
      // no scheme so it has to be prefixed.
      (str) =>
        str ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
      z.string().url(),
    ),
    // SHIP_ROCKET_AUTH_KEY: z.string(),
    // SHIPROCKET_PASSWORD: z.string(),
    // SHIPROCKET_EMAIL: z.string(),
    // Used by the admin password-reset action via @repo/mail, which now speaks
    // SMTP through Nodemailer. Host and port default to Gmail in that package.
    // Required in production only — see the note in apps/vyan-client/src/env.js.
    SMTP_USER:
      process.env.NODE_ENV === "production" ? z.string().email() : z.string().optional(),
    SMTP_PASSWORD:
      process.env.NODE_ENV === "production" ? z.string().min(1) : z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_SECURE: z.string().optional(),
    MAIL_FROM_NAME: z.string().optional(),
    // Optional: falls back to SMTP_USER.
    FROM_EMAIL: z.string().email().optional(),
    AWS_ACCESS_KEY_ID : z.string(),
    AWS_SECRET_ACCESS_KEY : z.string(),
    AWS_REGION : z.string(),
    AWS_BUCKET : z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_USER : z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    // SHIP_ROCKET_AUTH_KEY: process.env.SHIP_ROCKET_AUTH_KEY,
    // SHIPROCKET_PASSWORD: process.env.SHIPROCKET_PASSWORD,
    // SHIPROCKET_EMAIL: process.env.SHIPROCKET_EMAIL,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
    FROM_EMAIL: process.env.FROM_EMAIL,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_REGION: process.env.AWS_REGION,
    AWS_BUCKET: process.env.AWS_BUCKET,
    NEXT_PUBLIC_USER  : process.env.NEXT_PUBLIC_USER,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true
});
