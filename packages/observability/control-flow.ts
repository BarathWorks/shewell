/**
 * Next.js signals control flow by throwing.
 *
 * `redirect()` and `notFound()` throw errors carrying a `digest`, and accessing
 * `cookies()` or `headers()` during a static render throws `DYNAMIC_SERVER_USAGE`
 * so the framework can mark the route dynamic. None of these are failures.
 *
 * Any `catch` that does not re-throw them silently breaks the framework: redirects
 * stop redirecting, `notFound()` renders a blank page, and routes that should be
 * dynamic get prerendered at build time and fail against an unreachable database.
 *
 * Every catch-all in this package routes through `isFrameworkControlFlow` first.
 */

const CONTROL_FLOW_DIGESTS = [
  "NEXT_REDIRECT", // redirect() — digest is "NEXT_REDIRECT;replace;/path;307;"
  "NEXT_NOT_FOUND", // notFound()
  "DYNAMIC_SERVER_USAGE", // cookies()/headers() during a static render
  "BAILOUT_TO_CLIENT_SIDE_RENDERING", // useSearchParams() outside Suspense
];

export function isFrameworkControlFlow(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const digest = (error as { digest?: unknown }).digest;
  if (typeof digest === "string") {
    for (const marker of CONTROL_FLOW_DIGESTS) {
      if (digest === marker || digest.startsWith(`${marker};`)) return true;
    }
  }

  // Older Next versions identify the dynamic bailout by constructor name only.
  const name = (error as { name?: unknown }).name;
  if (name === "DynamicServerError" || name === "BailoutToCSRError") return true;

  // React's PPR postpone signal is not an Error at all.
  if ((error as { $$typeof?: symbol }).$$typeof === Symbol.for("react.postpone")) return true;

  return false;
}
