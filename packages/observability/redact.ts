/**
 * Keys whose values must never reach a log line.
 *
 * This is a healthcare product: appointment and patient objects routinely carry
 * names, phone numbers and free-text medical notes, and auth code paths carry
 * password hashes. Logging a whole Prisma row is the easy mistake — one already
 * shipped, printing `professionalUser` (with `passwordHash`) on every login.
 */
const SECRET_KEYS = new Set([
  "password",
  "passwordhash",
  "newpassword",
  "confirmpassword",
  "token",
  "accesstoken",
  "refreshtoken",
  "idtoken",
  "sessiontoken",
  "csrftoken",
  "secret",
  "clientsecret",
  "apikey",
  "authorization",
  "cookie",
  "setcookie",
  "razorpaykeysecret",
  "otp",
]);

/** Personal data: kept out of logs, but its presence is still recorded. */
const PII_KEYS = new Set([
  "email",
  "phonenumber",
  "phone",
  "aadhar",
  "aadhaar",
  "pan",
  "accountnumber",
  "ifsc",
  "message",
  "firstname",
  "lastname",
  "name",
  "address",
]);

const MAX_DEPTH = 4;
const MAX_ARRAY = 10;
const MAX_STRING = 500;

/** Masks an email as `j***@example.com` so it stays correlatable without being readable. */
export function maskEmail(value: string): string {
  const at = value.indexOf("@");
  if (at <= 0) return "[redacted]";
  return `${value[0]}***${value.slice(at)}`;
}

/**
 * Deep-clones a value, replacing secrets with `[redacted]` and personal data with
 * `[pii]`, and truncating anything unbounded. Never throws: logging must not be
 * able to fail the request it is describing.
 */
export function redact(input: unknown, depth = 0): unknown {
  try {
    if (input === null || input === undefined) return input;

    const type = typeof input;
    if (type === "string") {
      const s = input as string;
      return s.length > MAX_STRING ? `${s.slice(0, MAX_STRING)}…[+${s.length - MAX_STRING}]` : s;
    }
    if (type === "number" || type === "boolean" || type === "bigint") {
      return type === "bigint" ? String(input) : input;
    }
    if (input instanceof Date) return input.toISOString();
    if (input instanceof Error) return serializeError(input);

    if (depth >= MAX_DEPTH) return "[depth-limit]";

    if (Array.isArray(input)) {
      const head = input.slice(0, MAX_ARRAY).map((v) => redact(v, depth + 1));
      return input.length > MAX_ARRAY ? [...head, `[+${input.length - MAX_ARRAY} more]`] : head;
    }

    if (type === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
        const k = key.toLowerCase().replace(/[^a-z]/g, "");
        if (SECRET_KEYS.has(k)) {
          out[key] = "[redacted]";
        } else if (PII_KEYS.has(k)) {
          out[key] =
            k === "email" && typeof value === "string" ? maskEmail(value) : "[pii]";
        } else {
          out[key] = redact(value, depth + 1);
        }
      }
      return out;
    }

    return `[${type}]`;
  } catch {
    return "[unserializable]";
  }
}

/** Flattens an Error (including `cause` chains and Prisma's extra fields) into a plain object. */
export function serializeError(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) {
    return { message: String(error), type: typeof error };
  }

  const out: Record<string, unknown> = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };

  // Prisma attaches the useful bits here rather than on the message.
  const anyErr = error as unknown as Record<string, unknown>;
  for (const field of ["code", "digest", "clientVersion", "meta", "statusCode"]) {
    if (anyErr[field] !== undefined) out[field] = redact(anyErr[field], MAX_DEPTH - 1);
  }

  // Read through the index rather than `error.cause`: the property only exists on
  // the `Error` type under lib es2022, and the apps compile against different libs.
  const cause = anyErr.cause;
  if (cause && cause !== error) {
    out.cause = serializeError(cause);
  }

  return out;
}
