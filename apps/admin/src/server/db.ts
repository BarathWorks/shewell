import { PrismaClient } from '@repo/database';

import { env } from '@/env';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const db =
    globalForPrisma.prisma ??
    new PrismaClient({
         log: ['query', 'error', 'warn'] 
    });

if (true) globalForPrisma.prisma = db;
