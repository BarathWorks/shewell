import crypto from "crypto";
/**
 * Only what this module actually uses.
 *
 * Typing these as `PrismaClient` would reject the extended client returned by
 * `createPrismaClient` — `$extends` drops `$on`/`$use` from the type — and the apps
 * would silently fall back to suppressed build errors.
 */
export type RateLimitClient = {
  $queryRaw<T = unknown>(query: TemplateStringsArray, ...values: unknown[]): Promise<T>;
  rateLimit: {
    deleteMany(args: {
      where: { key?: string; expiresAt?: { lte: Date } };
    }): Promise<{ count: number }>;
  };
};

/**
 * Fixed-window rate limiting backed by Postgres.
 *
 * Serverless instances share no memory, so an in-process counter resets on every
 * cold start and is bypassed by parallel invocations. The counter lives in the
 * database so one limit applies across every instance.
 *
 * The client is passed in because each app owns its own PrismaClient.
 */

export type RateLimitResult = {
  allowed: boolean;
  /** Attempts left in the current window. */
  remaining: number;
  /** When the window resets. */
  resetAt: Date;
  /** Seconds until reset — suitable for a Retry-After header. */
  retryAfterSeconds: number;
};

export type RateLimitOptions = {
  /** Scope, e.g. "otp:send". Combined with `subject` to form the key. */
  scope: string;
  /** Who is being limited: an email, user id or IP address. */
  subject: string;
  /** Maximum attempts allowed per window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
};

type CounterRow = { count: number; expiresAt: Date };

/**
 * Consumes one attempt and reports whether it is allowed.
 *
 * The read, the window roll-over and the increment happen in **one** statement.
 * Doing them as separate queries is a check-then-act race: concurrent requests all
 * read the same count, all conclude they are under the limit, and all proceed —
 * which is precisely the shape of traffic an attacker sends. Measured against an
 * earlier read-then-write version, ten parallel requests all passed a limit of
 * three.
 *
 * Fails **open** on a database error: a rate limiter that hard-fails would take
 * the whole login flow down with it.
 */
export async function consumeRateLimit(
  db: RateLimitClient,
  { scope, subject, limit, windowSeconds }: RateLimitOptions
): Promise<RateLimitResult> {
  const key = `${scope}:${subject.trim().toLowerCase()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);
  const id = crypto.randomUUID();

  try {
    // ON CONFLICT makes this atomic: Postgres serialises concurrent writers on the
    // unique `key`, so every caller sees a distinct, monotonically increasing count.
    // An expired window resets to 1 in the same statement.
    const rows = await db.$queryRaw<CounterRow[]>`
      INSERT INTO "RateLimit" ("id", "key", "count", "windowStart", "expiresAt")
      VALUES (${id}, ${key}, 1, ${now}, ${expiresAt})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "RateLimit"."expiresAt" <= ${now} THEN 1
          ELSE "RateLimit"."count" + 1
        END,
        "windowStart" = CASE
          WHEN "RateLimit"."expiresAt" <= ${now} THEN ${now}
          ELSE "RateLimit"."windowStart"
        END,
        "expiresAt" = CASE
          WHEN "RateLimit"."expiresAt" <= ${now} THEN ${expiresAt}
          ELSE "RateLimit"."expiresAt"
        END
      RETURNING "count", "expiresAt"
    `;

    const row = rows[0];
    if (!row) {
      return { allowed: true, remaining: limit, resetAt: expiresAt, retryAfterSeconds: windowSeconds };
    }

    const count = Number(row.count);
    const resetAt = new Date(row.expiresAt);
    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt.getTime() - now.getTime()) / 1000));

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt,
      retryAfterSeconds,
    };
  } catch {
    // Fail open — see the note above.
    return { allowed: true, remaining: limit, resetAt: expiresAt, retryAfterSeconds: windowSeconds };
  }
}

/** Clears a limit early, e.g. after a successful sign-in. */
export async function resetRateLimit(db: RateLimitClient, scope: string, subject: string) {
  try {
    await db.rateLimit.deleteMany({
      where: { key: `${scope}:${subject.trim().toLowerCase()}` },
    });
  } catch {
    // Non-critical.
  }
}

/** Deletes expired rows. Safe to call from a cron route. */
export async function sweepRateLimits(db: RateLimitClient): Promise<number> {
  const { count } = await db.rateLimit.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
  return count;
}
