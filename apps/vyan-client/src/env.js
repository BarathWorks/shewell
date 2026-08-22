import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    NEXTAUTH_URL: z.preprocess(
      // An explicitly configured NEXTAUTH_URL wins.
      //
      // This previously read `process.env.VERCEL_URL ?? str`, which prefers the
      // per-deployment Vercel hostname over the custom domain the site actually
      // runs on — so OAuth callbacks and the links built from NEXTAUTH_URL
      // (password resets, the Google connect redirect) pointed at a URL the user
      // never visits. VERCEL_URL is the fallback, not the override, and it carries
      // no scheme so it has to be prefixed.
      (/** @type {any} */ str) =>
        str ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined),
      z.string().url(),
    ),
    // Mail — SMTP via Nodemailer (see `packages/mail`). SENDGRID_API_KEY is gone;
    // there is one transport now. Host and port default to Gmail inside the mail
    // package, so only the credentials are required.
    //
    // Required in production and optional elsewhere, matching NEXTAUTH_SECRET and
    // CRON_SECRET above: a production deploy without mail cannot sign anyone in, so
    // it should fail at build with a named variable. Locally, `@repo/mail` raises a
    // MailConfigError naming these two, and the OTP is printed to the dev console —
    // so a contributor with no mail account can still work on everything else.
    SMTP_USER:
      process.env.NODE_ENV === "production" ? z.string().email() : z.string().optional(),
    SMTP_PASSWORD:
      process.env.NODE_ENV === "production" ? z.string().min(1) : z.string().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.string().optional(),
    SMTP_SECURE: z.string().optional(),
    MAIL_FROM_NAME: z.string().optional(),

    RAZORPAY_KEY_SECRET:z.string(),

    // Both of these are read directly by route handlers that fail closed when they
    // are absent — the webhook rejects every delivery, and the cleanup cron refuses
    // to run. Declared here so that a production deploy missing them fails at build
    // with a named variable, rather than going quietly inert in production.
    RAZORPAY_WEBHOOK_SECRET:
      process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),
    CRON_SECRET:
      process.env.NODE_ENV === "production" ? z.string() : z.string().optional(),

    // Optional: `@repo/mail` falls back to SMTP_USER, which is the address Gmail
    // sends as anyway.
    FROM_EMAIL : z.string().email().optional(),
    GOOGLE_CLIENT_SECRET : z.string(),
    GOOGLE_CLIENT_ID : z.string(),
    // DISCORD_CLIENT_ID: z.string(),
    // DISCORD_CLIENT_SECRET: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_RAZORPAY_KEY_ID:z.string(),
    NEXT_PUBLIC_USER : z.string(),
    NEXT_PUBLIC_PROFESSIONAL : z.string(),
    NEXT_PUBLIC_GST : z.string(),
    NEXT_PUBLIC_PLATFORM_FEE : z.string()
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
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    MAIL_FROM_NAME: process.env.MAIL_FROM_NAME,
    RAZORPAY_KEY_SECRET:process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET:process.env.RAZORPAY_WEBHOOK_SECRET,
    CRON_SECRET:process.env.CRON_SECRET,
    NEXT_PUBLIC_RAZORPAY_KEY_ID:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    FROM_EMAIL : process.env.FROM_EMAIL,
    GOOGLE_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env. GOOGLE_CLIENT_ID,
    NEXT_PUBLIC_USER  : process.env.NEXT_PUBLIC_USER,
    NEXT_PUBLIC_PROFESSIONAL : process.env. NEXT_PUBLIC_PROFESSIONAL,
    NEXT_PUBLIC_GST : process.env.NEXT_PUBLIC_GST,
    NEXT_PUBLIC_PLATFORM_FEE : process.env.NEXT_PUBLIC_PLATFORM_FEE

    // DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    // DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  // skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  // Do NOT skip on Vercel. Skipping there turns a missing variable into a silent
  // runtime failure on every request instead of a loud, fixable build failure.
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
