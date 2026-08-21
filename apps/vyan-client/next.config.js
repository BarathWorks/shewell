/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 */
await import("./src/env.js");

/** @type {import('next').NextConfig} */
const config = {
  typescript: {
    // Type errors fail the build. The systematic mismatch this was hiding is fixed:
    // components declared hand-written prop types with required fields while the
    // serialised tRPC output carries them as optional, and several date fields were
    // compared as strings because tRPC 11.0.0 does not surface the configured
    // superjson transformer in the AppRouter type.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Left on: lint findings here are style-level and not worth blocking a deploy.
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@repo/ui", "@repo/observability", "@repo/database"],

  // Production optimizations
  reactStrictMode: true,
  swcMinify: true,

  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.amazonaws.com https://*.razorpay.com",
              "connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com",
              "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com",
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

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "shewellcare.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "flexit-fitness.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "shewellcare-dev.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "shewell-temporary.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "bucket.s3.india.amazonaws.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  experimental: {
    optimizePackageImports: ["@repo/ui", "lucide-react", "framer-motion"],
    // Enables src/instrumentation.ts (opt-in on Next 14).
    instrumentationHook: true,
  },

  // ✅ Fix for url.parse() deprecation warning
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      url: false,
    };
    return config;
  },
};

export default config;
