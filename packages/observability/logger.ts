import { redact, serializeError } from "./redact";

export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
  /** Which app emitted this — set once via `initObservability`. */
  app?: string;
  /** Route or procedure path, e.g. `/session/[slug]` or `session.getSessionBySlug`. */
  route?: string;
  /** Correlates a log line with the reference shown to the user. */
  reference?: string;
  /** Next.js error digest, when one exists. */
  digest?: string;
  /** Authenticated user id. Never log the email instead — ids are not personal data. */
  userId?: string;
  /** Where the error surfaced: server action, tRPC procedure, React boundary, … */
  source?: string;
  [key: string]: unknown;
};

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

let appName = process.env.NEXT_PUBLIC_APP_NAME ?? "app";
let minLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ?? (process.env.NODE_ENV === "production" ? "info" : "debug");

export function configureLogger(options: { app?: string; level?: LogLevel }) {
  if (options.app) appName = options.app;
  if (options.level) minLevel = options.level;
}

/**
 * Emits one JSON object per line.
 *
 * Vercel's Runtime Logs parse JSON on stdout/stderr into queryable fields, so a
 * single line carries the whole event and stays greppable by `reference`. Errors go
 * to stderr so they surface in Vercel's error filter.
 */
function emit(level: LogLevel, event: string, context: LogContext = {}) {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return;

  const { error, ...rest } = context as LogContext & { error?: unknown };

  const line = {
    level,
    event,
    app: appName,
    time: new Date().toISOString(),
    ...(redact(rest) as Record<string, unknown>),
    ...(error !== undefined ? { error: serializeError(error) } : {}),
  };

  let serialized: string;
  try {
    serialized = JSON.stringify(line);
  } catch {
    // Circular structure or similar — never let logging throw.
    serialized = JSON.stringify({ level, event, app: appName, note: "unserializable-context" });
  }

  if (level === "error" || level === "warn") {
    console.error(serialized);
  } else {
    console.log(serialized);
  }
}

export const logger = {
  debug: (event: string, context?: LogContext) => emit("debug", event, context),
  info: (event: string, context?: LogContext) => emit("info", event, context),
  warn: (event: string, context?: LogContext) => emit("warn", event, context),
  error: (event: string, context?: LogContext) => emit("error", event, context),
};
