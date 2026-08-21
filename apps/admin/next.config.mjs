// Runs the env schema at build time. `src/env.js` existed and was imported
// nowhere — the auth module's import of it is commented out — so a production
// deploy missing NEXTAUTH_SECRET or SENDGRID_API_KEY failed at request time
// instead of failing the build with a named variable.
//
// This file is `.mjs` because `src/env.js` is an ES module: the CommonJS
// `next.config.js` it replaces could not `require()` it. The client and
// practitioner apps already load their schema this way.
await import('./src/env.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Workspace packages ship as raw TypeScript and must be compiled by the app.
  transpilePackages: ['@repo/observability', '@repo/database'],
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

  experimental: {
    // Enables src/instrumentation.ts (opt-in on Next 14).
    instrumentationHook: true
  },

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
              "connect-src 'self'",
              "frame-src 'none'",
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
        protocol: 'https',
        hostname: '**.amazonaws.com'
      }
    ]
  },
};

export default nextConfig;
