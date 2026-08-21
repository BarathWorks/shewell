import { captureException, type CaptureContext, type CaptureResult } from "./capture";
import { logger } from "./logger";
import { isFrameworkControlFlow } from "./control-flow";

export type ActionFailure = {
  ok: false;
  error: {
    reference: string;
    kind: CaptureResult["kind"];
    message: string;
    retryable: boolean;
  };
};

export type ActionSuccess<T> = { ok: true; data: T };
export type ActionResult<T> = ActionSuccess<T> | ActionFailure;

/**
 * Wraps a server action so a throw becomes a typed, safe result instead of an
 * unhandled rejection that Next renders as an opaque digest page.
 *
 * Server actions are the gap the built-in error boundaries do not cover: an
 * uncaught throw inside one surfaces to the client with no message and is not
 * logged anywhere in production.
 */
export function withServerAction<Args extends unknown[], T>(
  name: string,
  handler: (...args: Args) => Promise<T>,
  context: CaptureContext = {}
): (...args: Args) => Promise<ActionResult<T>> {
  return async (...args: Args): Promise<ActionResult<T>> => {
    const startedAt = Date.now();
    try {
      const data = await handler(...args);
      logger.info("action.ok", { source: "server-action", route: name, ms: Date.now() - startedAt });
      return { ok: true, data };
    } catch (error) {
      // redirect() and notFound() are thrown, not returned. Swallowing them here
      // would turn a working redirect into a silent no-op.
      if (isFrameworkControlFlow(error)) throw error;

      const captured = captureException(error, {
        ...context,
        source: "server-action",
        route: name,
        ms: Date.now() - startedAt,
      });
      return { ok: false, error: captured };
    }
  };
}

/**
 * Runs one piece of a page's data loading in isolation.
 *
 * A dashboard that fetches six things should not go blank because the sixth
 * failed. Wrap each fetch and render the sections that resolved; the failed one
 * gets a fallback value and its own log line with a reference.
 */
export async function safeAsync<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
  context: CaptureContext = {}
): Promise<{ data: T; error: CaptureResult | null }> {
  try {
    return { data: await fn(), error: null };
  } catch (error) {
    // Catching the DYNAMIC_SERVER_USAGE bailout makes Next believe the route is
    // static, so it prerenders it at build time against no database.
    if (isFrameworkControlFlow(error)) throw error;

    const captured = captureException(error, { ...context, source: "data-fetch", route: label });
    return { data: fallback, error: captured };
  }
}

/** `safeAsync` for callers that only need the value. */
export async function safeValue<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T,
  context: CaptureContext = {}
): Promise<T> {
  const { data } = await safeAsync(label, fn, fallback, context);
  return data;
}
