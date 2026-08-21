/**
 * Error classification.
 *
 * The outage that produced "Digest: 2387125207" was a suspended database, but
 * nothing in the logs said so. Classifying every failure into one of these buckets
 * is what turns a digest into an answer: `DB_UNAVAILABLE` means check the database
 * provider, `DB_SCHEMA` means a migration did not run, `EXTERNAL_SERVICE` means a
 * third party is down. The bucket is logged and drives what the user is told.
 */
export type ErrorKind =
  | "DB_UNAVAILABLE"
  | "DB_SCHEMA"
  | "DB_CONSTRAINT"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "PAYMENT"
  | "EXTERNAL_SERVICE"
  | "CONFIG"
  | "UNKNOWN";

/** Whether retrying the same request could plausibly succeed. */
export const RETRYABLE: ReadonlySet<ErrorKind> = new Set<ErrorKind>([
  "DB_UNAVAILABLE",
  "EXTERNAL_SERVICE",
]);

/** Messages safe to show a user: no internals, no data, no blame. */
const PUBLIC_MESSAGE: Record<ErrorKind, string> = {
  DB_UNAVAILABLE: "We are having trouble reaching our systems. Please try again in a moment.",
  DB_SCHEMA: "Something is misconfigured on our side. Our team has been notified.",
  DB_CONSTRAINT: "That conflicts with something that already exists.",
  NOT_FOUND: "We could not find what you were looking for.",
  UNAUTHORIZED: "Please sign in to continue.",
  FORBIDDEN: "You do not have access to this.",
  VALIDATION: "Some of the details provided are not valid.",
  PAYMENT: "We could not complete the payment. You have not been charged twice.",
  EXTERNAL_SERVICE: "A service we rely on is temporarily unavailable. Please try again.",
  CONFIG: "Something is misconfigured on our side. Our team has been notified.",
  UNKNOWN: "Something went wrong. Please try again.",
};

/**
 * Prisma error codes worth naming.
 * @see https://www.prisma.io/docs/orm/reference/error-reference
 */
const PRISMA_CODES: Record<string, ErrorKind> = {
  P1000: "CONFIG", // auth failed
  P1001: "DB_UNAVAILABLE", // cannot reach server  <- the production outage
  P1002: "DB_UNAVAILABLE", // timed out
  P1008: "DB_UNAVAILABLE", // operation timed out
  P1010: "CONFIG", // access denied
  P1017: "DB_UNAVAILABLE", // server closed the connection
  P2002: "DB_CONSTRAINT", // unique constraint
  P2003: "DB_CONSTRAINT", // foreign key
  P2021: "DB_SCHEMA", // table does not exist  <- unapplied migrations
  P2022: "DB_SCHEMA", // column does not exist
  P2025: "NOT_FOUND",
};

/** An error raised deliberately, already classified. */
export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly context: Record<string, unknown>;

  constructor(kind: ErrorKind, message: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = "AppError";
    this.kind = kind;
    this.context = context;
  }
}

/** Best-effort classification of anything thrown anywhere. */
export function classifyError(error: unknown): ErrorKind {
  if (error instanceof AppError) return error.kind;
  if (!error) return "UNKNOWN";

  const anyErr = error as Record<string, unknown>;
  const name = String(anyErr.name ?? "");
  const code = String(anyErr.code ?? "");
  const message = String(anyErr.message ?? "");

  if (code && PRISMA_CODES[code]) return PRISMA_CODES[code]!;

  // Thrown before a code is assigned — engine could not start or connect at all.
  if (name === "PrismaClientInitializationError") return "DB_UNAVAILABLE";
  if (name === "PrismaClientValidationError") return "DB_SCHEMA";
  if (name === "PrismaClientRustPanicError") return "DB_UNAVAILABLE";

  // PgBouncer in transaction mode without `pgbouncer=true`.
  if (/prepared statement .* already exists/i.test(message)) return "CONFIG";
  if (/Can't reach database server|Connection terminated|ECONNREFUSED/i.test(message)) {
    return "DB_UNAVAILABLE";
  }

  if (name === "ZodError" || /validation/i.test(name)) return "VALIDATION";
  if (/UNAUTHORIZED|not authenticated/i.test(message)) return "UNAUTHORIZED";
  if (/FORBIDDEN|not allowed/i.test(message)) return "FORBIDDEN";
  if (/razorpay|refund|payment/i.test(message)) return "PAYMENT";
  if (/ETIMEDOUT|ENOTFOUND|fetch failed|socket hang up/i.test(message)) return "EXTERNAL_SERVICE";

  // S3 and other AWS SDK failures carry an HTTP status.
  const status = Number(anyErr.statusCode ?? anyErr.$metadata ?? NaN);
  if (Number.isFinite(status) && status >= 500) return "EXTERNAL_SERVICE";

  return "UNKNOWN";
}

export function publicMessageFor(kind: ErrorKind): string {
  return PUBLIC_MESSAGE[kind] ?? PUBLIC_MESSAGE.UNKNOWN;
}

/**
 * Short, unambiguous, case-insensitive id a user can read over the phone.
 * Excludes vowels and look-alike characters so it cannot spell anything or be
 * misheard (no O/0, I/1).
 */
const ALPHABET = "23456789BCDFGHJKLMNPQRSTVWXZ";

export function newReference(): string {
  const bytes = new Uint8Array(8);

  // Not a security token — but crypto is available in every runtime this ships to
  // (browser, Node 18+, edge), so there is no reason to reach for Math.random.
  const webcrypto = (globalThis as { crypto?: Crypto }).crypto;
  if (webcrypto?.getRandomValues) {
    webcrypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }

  // Indexed rather than for..of: admin compiles against a lower TS target where
  // iterating a typed array needs downlevelIteration.
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}
