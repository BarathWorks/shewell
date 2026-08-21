/**
 * Shared observability for all three apps.
 *
 * Server-side only and deliberately dependency-free: the React error boundaries
 * live in each app because they are presentational, and admin does not transpile
 * workspace packages.
 *
 * Wiring, per app:
 *   1. `initObservability({ app: "vyan-client" })` in `instrumentation.ts`
 *   2. `createTrpcErrorHandler()` as `onError` in the tRPC route handler
 *   3. `withServerAction` around server actions
 *   4. `safeAsync` around any single section's data fetch
 *   5. `captureException` in `error.tsx` / `global-error.tsx`
 */
export { logger, configureLogger, type LogLevel, type LogContext } from "./logger";
export { redact, serializeError, maskEmail } from "./redact";
export {
  AppError,
  classifyError,
  publicMessageFor,
  newReference,
  RETRYABLE,
  type ErrorKind,
} from "./errors";
export {
  captureException,
  initObservability,
  registerReporter,
  type CaptureContext,
  type CaptureResult,
  type Reporter,
} from "./capture";
export {
  withServerAction,
  safeAsync,
  safeValue,
  type ActionResult,
  type ActionSuccess,
  type ActionFailure,
} from "./server";
export { createTrpcErrorHandler } from "./trpc";
export { isFrameworkControlFlow } from "./control-flow";
