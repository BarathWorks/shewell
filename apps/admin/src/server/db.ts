import { getPrismaSingleton } from "@repo/database";
import { logger } from "@repo/observability";

/**
 * Process-wide Prisma client.
 *
 * Created through the shared factory so all three apps get the same guarantees:
 * a single pool per process, no query/parameter logging in production, and slow
 * operations reported by model and action only.
 */
export const db = getPrismaSingleton({
  app: "admin",
  isProduction: process.env.NODE_ENV === "production",
  slowQueryMs: Number(process.env.SLOW_QUERY_MS ?? 500),
  onSlowQuery: ({ app, model, action, ms }) => {
    logger.warn("db.slow_query", { source: "prisma", app, model, action, ms });
  },
});
