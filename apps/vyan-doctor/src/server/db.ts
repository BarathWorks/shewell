import { PrismaClient } from "@repo/database";

import { env } from "../env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};


export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "production" ? ["query", "warn", "info", "error"] : ["query", "warn", "info", "error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;
