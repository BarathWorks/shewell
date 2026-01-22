/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import('next').NextConfig} */
const config = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@repo/ui"],
  allowedDevOrigins: ["144.24.147.193"],
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
      }
    ],
  },
};

export default config;
