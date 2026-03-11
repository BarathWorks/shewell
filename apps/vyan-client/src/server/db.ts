import { PrismaClient } from "@repo/database";

import { env } from "../env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// PERFORMANCE: Enhanced Prisma configuration with connection pooling
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "production"
        ? ["error"]
        : [
            { level: "error", emit: "stdout" },
            { level: "warn", emit: "stdout" },
            // Uncomment to debug slow queries in development:
            // { level: "query", emit: "event" },
          ],
  });

// Optional: Log slow queries in development (uncomment to enable)
// if (env.NODE_ENV !== "production") {
//   db.$on("query" as any, (e: any) => {
//     if (e.duration > 1000) {
//       console.warn(`⚠️  Slow query (${e.duration}ms):`, e.query);
//     }
//   });
// }

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
