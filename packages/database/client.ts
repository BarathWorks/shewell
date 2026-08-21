import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Shared Prisma client factory.
 *
 * Three things this exists to get right, each of which was wrong somewhere:
 *
 * 1. **Never log queries in production.** Prisma's `query` log level prints the SQL
 *    *and its parameters* — which here means patient names, emails, medical notes
 *    and password hashes, straight into the platform log. One app had
 *    `["query", "warn", "info", "error"]` enabled in production.
 *
 * 2. **One client per process.** A new `PrismaClient` per module reload opens a new
 *    connection pool each time; on a warm serverless instance that leaks
 *    connections until the pooler starts refusing them.
 *
 * 3. **Slow queries must be visible without logging data.** The extension below
 *    times every operation and reports model, action and duration — never
 *    arguments.
 */

export type PrismaLike = ReturnType<typeof createPrismaClient>;

export type CreatePrismaOptions = {
  /** App name, included in slow-query logs. */
  app: string;
  isProduction: boolean;
  /** Operations slower than this are logged. Default 500ms. */
  slowQueryMs?: number;
  /** Receives slow-query and error reports. Wire to your logger. */
  onSlowQuery?: (info: { app: string; model: string; action: string; ms: number }) => void;
};

function baseClient(options: CreatePrismaOptions) {
  return new PrismaClient({
    // `query` is deliberately absent in every environment: it emits bound
    // parameters. Use the timing extension below instead.
    log: options.isProduction
      ? [
          { level: "error", emit: "stdout" },
          { level: "warn", emit: "stdout" },
        ]
      : [
          { level: "error", emit: "stdout" },
          { level: "warn", emit: "stdout" },
          { level: "info", emit: "stdout" },
        ],
    // Minimal error text in production; full detail (with the failing query) only
    // in development.
    errorFormat: options.isProduction ? "minimal" : "pretty",
  });
}

/**
 * Operations that only read. Safe to repeat, so these retry on any transient
 * failure.
 */
const READ_OPERATIONS = new Set([
  "findUnique",
  "findUniqueOrThrow",
  "findFirst",
  "findFirstOrThrow",
  "findMany",
  "count",
  "aggregate",
  "groupBy",
]);

/**
 * Failures that happen *before* the statement reaches the server: the pool could
 * not hand out a connection, or the server was unreachable. A write that never
 * executed is safe to repeat; one that failed mid-flight is not, which is why this
 * set is narrower than TRANSIENT_CODES.
 */
const PRE_EXECUTION_CODES = new Set(["P1001", "P1002", "P1017", "P2024"]);

function failedBeforeExecuting(error: unknown): boolean {
  const anyErr = error as { code?: string; name?: string; message?: string };
  if (anyErr?.code && PRE_EXECUTION_CODES.has(anyErr.code)) return true;
  if (anyErr?.name === "PrismaClientInitializationError") return true;
  return /Can't reach database server|max clients reached|Timed out fetching a new connection/i.test(
    String(anyErr?.message ?? "")
  );
}

export function createPrismaClient(options: CreatePrismaOptions) {
  const slowQueryMs = options.slowQueryMs ?? 500;

  return baseClient(options).$extends({
    name: "timing",
    query: {
      async $allOperations({ model, operation, args, query }) {
        const startedAt = Date.now();
        try {
          // Retry is applied here rather than at call sites.
          //
          // `withDbRetry` was written for exactly this and then imported by nothing,
          // so a pooled-Postgres blip — "max clients reached" from PgBouncer, an
          // idle connection dropped — surfaced to the user as a hard error on every
          // one of several hundred call sites. Wiring it in at the extension makes
          // it apply everywhere without touching any of them, and without anyone
          // having to remember.
          //
          // Reads repeat freely. Writes repeat only when the failure proves the
          // statement never ran, so a booking or a payout cannot be applied twice.
          const isRead = READ_OPERATIONS.has(operation);

          return await withDbRetry(() => query(args), {
            attempts: 3,
            baseDelayMs: 100,
            shouldRetry: isRead ? isTransientDbError : failedBeforeExecuting,
          });
        } finally {
          const ms = Date.now() - startedAt;
          if (ms >= slowQueryMs && options.onSlowQuery) {
            // Model and action only. `args` is never reported: it carries the
            // values that make a query slow *and* the data we must not log.
            options.onSlowQuery({
              app: options.app,
              model: model ?? "raw",
              action: operation,
              ms,
            });
          }
        }
      },
    },
  });
}

/**
 * Returns the process-wide client, creating it once.
 *
 * The instance is stashed on `globalThis` in every environment, not just
 * development: Next.js re-evaluates modules on a warm serverless instance too, and
 * each fresh `PrismaClient` would open another pool against PgBouncer.
 */
export function getPrismaSingleton(options: CreatePrismaOptions) {
  const key = "__shewell_prisma__";
  const store = globalThis as unknown as Record<string, PrismaLike | undefined>;

  const existing = store[key];
  if (existing) return existing;

  const client = createPrismaClient(options);
  store[key] = client;
  return client;
}

/** Error codes that mean "the database was momentarily unreachable". */
const TRANSIENT_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);

export function isTransientDbError(error: unknown): boolean {
  if (!error) return false;
  const anyErr = error as { code?: string; name?: string; message?: string };
  if (anyErr.code && TRANSIENT_CODES.has(anyErr.code)) return true;
  if (anyErr.name === "PrismaClientInitializationError") return true;
  return /Can't reach database server|Connection terminated|ECONNRESET|ETIMEDOUT|max clients reached/i.test(
    String(anyErr.message ?? "")
  );
}

/**
 * Retries an operation across a brief connection blip.
 *
 * Pooled Postgres drops idle connections and Supabase's pooler rejects bursts with
 * "max clients reached". Both are transient, and both currently surface to users as
 * a hard error. Only transient failures are retried — a constraint violation or a
 * bug must fail immediately, not three times.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  options: {
    attempts?: number;
    baseDelayMs?: number;
    /**
     * Decides whether a given failure is worth repeating. Defaults to
     * `isTransientDbError`. `createPrismaClient` passes a narrower predicate for
     * write operations, so a statement that may already have been applied is never
     * retried.
     */
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 100;
  const shouldRetry = options.shouldRetry ?? isTransientDbError;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error) || attempt === attempts) throw error;
      // Exponential backoff with jitter, so retries from many instances do not
      // land on the pooler at the same instant and repeat the same overload.
      const delay = baseDelayMs * 2 ** (attempt - 1) * (0.5 + Math.random());
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export { Prisma };
