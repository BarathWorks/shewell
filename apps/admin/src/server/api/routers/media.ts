import { z } from 'zod';

import { createTRPCRouter, adminProcedure } from '@/src/server/api/trpc';
import { db } from '@/src/server/db';

export const mediaRouter = createTRPCRouter({
  getAll: adminProcedure('content:read')
    .input(
      z.object({
        limit: z.number().optional(),
        page: z.number().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit || 20;
      const page = input.page || 1;
      const data = await db.media.findMany({
        take: limit,
        skip: (page - 1) * limit,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          mimeType: true,
          fileKey: true,
          fileUrl: true,
          comments: true,
          createdAt: true,
          updatedAt: true
        }
      });

      const count = await db.media.count();
      const totalPages = count / limit;

      return {
        data,
        count,
        totalPages
      };
    })
});
