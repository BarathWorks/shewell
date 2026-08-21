# Observability and error handling

How to find out what actually broke, and how failures are contained so one broken
part does not take down the app.

## Diagnosing a production error

Every failure produces a **reference** like `7KQD-M3XB`. The user sees it on screen;
the same string appears in exactly one server log line.

1. Vercel dashboard → the project → **Logs** → filter `reference` or paste the code
   into the search box.
2. The line is a single JSON object:

```json
{
  "level": "error",
  "event": "error.captured",
  "app": "vyan-client",
  "time": "2026-08-19T13:41:07.882Z",
  "source": "trpc",
  "route": "session.getSessionBySlug",
  "reference": "7KQD-M3XB",
  "kind": "DB_UNAVAILABLE",
  "retryable": true,
  "userId": "cmt04e8...",
  "error": {
    "name": "PrismaClientInitializationError",
    "message": "Can't reach database server",
    "code": "P1001",
    "stack": "..."
  }
}
```

`kind` is the answer to "what do I do about it":

| kind | Meaning | First thing to check |
|---|---|---|
| `DB_UNAVAILABLE` | Database unreachable or timing out | Supabase project status, billing, connection limits |
| `DB_SCHEMA` | Table or column missing | A migration did not run — `prisma migrate deploy` |
| `DB_CONSTRAINT` | Unique or foreign-key violation | Usually a real bug or a duplicate submit |
| `CONFIG` | Misconfiguration | Wrong credentials, or `pgbouncer=true` missing from `DATABASE_URL` |
| `EXTERNAL_SERVICE` | S3 / Razorpay / Google / mail failing | That provider's status page |
| `PAYMENT` | Razorpay call failed | Razorpay dashboard; check whether the charge actually landed |
| `VALIDATION` | Bad input reached the server | Client sent something the schema rejected |
| `UNAUTHORIZED` / `FORBIDDEN` | Auth rejected the caller | Expected for signed-out traffic |
| `UNKNOWN` | Unclassified | Read the stack; consider adding a rule to `classifyError` |

Searching without a reference: filter on `"level":"error"`, or `"kind":"DB_UNAVAILABLE"`
to see whether a spike is one user or everyone.

## Why this exists

The outage that showed `Digest: 2387125207` was a suspended database. Nothing was
logged, because all three apps passed `onError: undefined` to tRPC in production
and had no error boundaries at all. The digest was the only handle, and it mapped
to nothing. Every gap that produced that is now closed:

- tRPC errors are logged in **all** environments, with the procedure path.
- Server actions log through `withServerAction`.
- Client-side React errors POST to `/api/observability/report`.
- Root layouts no longer let a database blip blank the whole site.

## Containment: which boundary catches what

Boundaries are layered so a failure is handled as close to its cause as possible.

| Layer | File | Catches | Blast radius |
|---|---|---|---|
| Widget | `<SectionBoundary>` | Render errors in one component subtree | That widget only |
| Data fetch | `safeAsync` / `safeValue` | A throw in one server-side fetch | That value degrades to a fallback |
| Route segment | `src/app/<segment>/error.tsx` | Anything in that segment | That section; header/nav survive |
| Route root | `src/app/error.tsx` | Anything else under the root layout | The page |
| Global | `src/app/global-error.tsx` | Errors in the root layout itself | The app |

The point is that upper layers should rarely fire. If `global-error.tsx` is firing
in production, something in a root layout is unwrapped.

### Isolating a widget

```tsx
import { SectionBoundary } from "~/components/section-boundary";

<SectionBoundary name="home:testimonials">
  <Testimonials />
</SectionBoundary>

// Non-essential decoration: render nothing rather than an error card.
<SectionBoundary name="home:carousel" silent>
  <PartnerCarousel />
</SectionBoundary>
```

Only catches errors thrown while rendering. Event handlers and async callbacks must
report themselves:

```tsx
import { reportClientError } from "~/lib/report-client-error";

try {
  await bookAppointment();
} catch (error) {
  const reference = reportClientError({ error, boundary: "booking:submit" });
  toast.error(`Could not book. Reference ${reference}`);
}
```

### Isolating a server-side fetch

A page that loads six things should not go blank because the sixth failed:

```tsx
import { safeAsync } from "@repo/observability";

const { data: experts, error } = await safeAsync(
  "home:topExperts",
  () => db.professionalUser.findMany({ where: { active: true } }),
  []
);

return experts.length ? <ExpertList experts={experts} /> : <ExpertsUnavailable />;
```

### Server actions

```ts
import { withServerAction } from "@repo/observability";

export const cancelAppointment = withServerAction(
  "appointment.cancel",
  async (id: string) => { /* ... */ }
);

// Returns { ok: true, data } | { ok: false, error: { reference, kind, message, retryable } }
```

The `message` is always safe to show a user — it never contains internals.

## What is never logged

`redact.ts` strips values before they are serialized:

- **Secrets** → `[redacted]`: passwords and hashes, tokens, API keys, cookies, OTPs.
- **Personal data** → `[pii]`: phone numbers, Aadhaar/PAN, bank details, names,
  addresses, and free-text `message` fields (which hold medical detail).
- **Emails** → masked as `j***@example.com`, so they stay correlatable but unreadable.

Log `userId`, never `email`. Ids are not personal data and are easier to search.

This matters here: a previous build logged the whole `professionalUser` row on every
login, including `passwordHash`, straight into production logs.

## Adding Sentry

Everything already routes through `captureException`, so this is the only change:

```bash
pnpm add @sentry/nextjs --filter vyan-client
```

```ts
// apps/vyan-client/src/instrumentation.ts
import * as Sentry from "@sentry/nextjs";
import { initObservability } from "@repo/observability";

export function register() {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });

  initObservability({
    app: "vyan-client",
    reporter: (error, context) =>
      Sentry.captureException(error, {
        tags: { kind: context.kind, reference: context.reference },
        extra: context,
      }),
  });
}
```

Set `SENTRY_DSN` in Vercel. Without it nothing breaks — structured logs continue as
before. Tag events with `reference` so a user-reported code finds the Sentry event
directly.

## Log levels

`LOG_LEVEL` accepts `debug` | `info` | `warn` | `error`; production defaults to `info`.
Errors and warnings go to stderr so Vercel's error filter picks them up. Set
`LOG_LEVEL=debug` temporarily when reproducing something.
