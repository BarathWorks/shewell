import { captureException } from "./capture";
import { classifyError } from "./errors";
import { logger } from "./logger";

type TrpcErrorHandlerArgs = {
  error: { message: string; code?: string; cause?: unknown };
  path?: string;
  type?: string;
  ctx?: unknown;
  input?: unknown;
};

/** Client mistakes, not outages — noisy and not worth alerting on. */
const EXPECTED_TRPC_CODES = new Set([
  "UNAUTHORIZED",
  "FORBIDDEN",
  "NOT_FOUND",
  "BAD_REQUEST",
  "CONFLICT",
  "PARSE_ERROR",
]);

/**
 * Error handler for `fetchRequestHandler`.
 *
 * All three apps previously passed `onError: undefined` in production, so every
 * failing procedure returned a 500 to the browser and wrote nothing to the server
 * logs. This logs each one with the procedure path and a classification.
 *
 * `getUserId` is a callback rather than a value because the tRPC context is only
 * available per-request.
 */
export function createTrpcErrorHandler(options: {
  getUserId?: (ctx: unknown) => string | undefined;
} = {}) {
  return ({ error, path, type, ctx }: TrpcErrorHandlerArgs) => {
    const code = error.code ?? "INTERNAL_SERVER_ERROR";

    // tRPC wraps the original throw; classify the cause where there is one.
    const underlying = error.cause ?? error;
    const kind = classifyError(underlying);

    if (EXPECTED_TRPC_CODES.has(code)) {
      // Recorded at warn level and kept out of the error tracker, so a burst of
      // 401s from signed-out browsers cannot bury a real outage.
      logger.warn("trpc.rejected", {
        source: "trpc",
        route: path ?? "<no-path>",
        trpcCode: code,
        trpcType: type,
        userId: options.getUserId?.(ctx),
        // Not `message`: that key is redacted as PII (patient notes use it).
        reason: error.message,
      });
      return;
    }

    captureException(underlying, {
      source: "trpc",
      route: path ?? "<no-path>",
      trpcCode: code,
      trpcType: type,
      kindHint: kind,
      userId: options.getUserId?.(ctx),
    });
  };
}
