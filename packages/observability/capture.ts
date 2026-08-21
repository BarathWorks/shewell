import { logger, type LogContext, configureLogger, type LogLevel } from "./logger";
import { classifyError, newReference, publicMessageFor, RETRYABLE, type ErrorKind } from "./errors";

export type CaptureContext = Omit<LogContext, "error">;

export type CaptureResult = {
  /** Show this to the user; search logs for it to find the full error. */
  reference: string;
  kind: ErrorKind;
  /** Safe to render. Never contains internals. */
  message: string;
  retryable: boolean;
};

/**
 * An external error tracker (Sentry, Highlight, …). Kept as a hook rather than a
 * dependency so this package stays dependency-free and the apps still get full
 * structured logging when no tracker is configured.
 */
export type Reporter = (error: unknown, context: CaptureContext & { reference: string; kind: ErrorKind }) => void;

let reporter: Reporter | null = null;

export function registerReporter(next: Reporter | null) {
  reporter = next;
}

export function initObservability(options: { app: string; level?: LogLevel; reporter?: Reporter | null }) {
  configureLogger({ app: options.app, level: options.level });
  if (options.reporter !== undefined) reporter = options.reporter;
}

/**
 * Records an error once, and returns what to show the user.
 *
 * Every call produces a `reference`. The same reference is printed in the log line
 * and rendered in the UI, so a user saying "I saw 7KQD-M3XB" maps to exactly one
 * event without guessing at timestamps.
 */
export function captureException(error: unknown, context: CaptureContext = {}): CaptureResult {
  const kind = classifyError(error);

  // Prefer Next.js's own digest when present so our line joins up with the one
  // Next already wrote for the same failure.
  const digest =
    typeof context.digest === "string" && context.digest ? context.digest : undefined;
  const reference =
    typeof context.reference === "string" && context.reference ? context.reference : newReference();

  logger.error("error.captured", {
    ...context,
    reference,
    digest,
    kind,
    retryable: RETRYABLE.has(kind),
    error,
  });

  if (reporter) {
    try {
      reporter(error, { ...context, reference, kind });
    } catch (reporterError) {
      // A broken tracker must never take down the request it was reporting on.
      logger.warn("error.reporter_failed", { reference, error: reporterError });
    }
  }

  return {
    reference,
    kind,
    message: publicMessageFor(kind),
    retryable: RETRYABLE.has(kind),
  };
}
