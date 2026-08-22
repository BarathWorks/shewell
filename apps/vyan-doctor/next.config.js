/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");
import path from "path";

/** @type {import("next").NextConfig} */
const config = {
  // Required for monorepo Prisma support on Vercel.
  // In Next 14 this key lives under `experimental`; at the top level it was silently
  // ignored ("Unrecognized key(s) in object: 'outputFileTracingRoot'").
  experimental: {
    outputFileTracingRoot: path.join(import.meta.dirname, "../../"),
    // Enables src/instrumentation.ts (opt-in on Next 14).
    instrumentationHook: true,
  },
  // Strips console output from production bundles, keeping error/warn.
  //
  // This app logs sessions, appointment rows and free-text clinical notes through
  // bare console calls; the client app already had this and these two did not, so
  // patient data was reaching the platform log on every request. The structured
  // logger in @repo/observability redacts by key and is the right path for anything
  // that genuinely needs recording.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  typescript: {
    // Type errors fail the build. What this was hiding is fixed: ten registration
    // forms read `resp.message` off a discriminated union without checking
    // `success`, so a failed save showed a success toast and advanced the
    // practitioner to the next step.
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@repo/ui", "@repo/observability", "@repo/database"],

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            // Content-Security-Policy. The header set was otherwise complete —
            // frame-options, nosniff, HSTS, referrer, permissions — but had no CSP,
            // which is the one control that bounds what injected script can do.
            //
            // 'unsafe-inline'/'unsafe-eval' on script-src is required by Next 14's
            // inline bootstrap and dev overlay; tightening that needs per-request
            // nonces, which is a larger change than this pass. The value here still
            // pins *where* script may come from, which is what stops an injected
            // tag from loading a remote payload or beaconing data out.
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "object-src 'none'",
              "frame-ancestors 'self'",
              "form-action 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.amazonaws.com",
              // S3 is here, not just in `img-src`.
              //
              // Uploads are direct-to-S3 with a presigned URL: the server signs it
              // and the *browser* PUTs the file. `connect-src 'self'` blocked that
              // fetch outright, so every upload in this app failed — silently, in
              // the console, with the form simply refusing to advance.
              //
              // In the practitioner portal that made registration impossible to
              // finish: the profile photo is a required field on step 2, so the
              // wizard could not be completed by anyone. `img-src` already trusted
              // this origin to *display* the files; it has to be trusted to receive
              // them too.
              "connect-src 'self' https://*.amazonaws.com",
              "frame-src 'self' https://meet.google.com",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shewellcare.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "shewellcare-dev.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "shewell-temporary.s3.ap-south-1.amazonaws.com",
      }
    ],
  },
};

export default config;
