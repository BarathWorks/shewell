import nodemailer, { type Transporter } from "nodemailer";

/**
 * Transactional email — SMTP via Nodemailer.
 *
 * The previous implementation sent through SendGrid (`@sendgrid/mail` +
 * `SENDGRID_API_KEY`) with a half-wired Gmail fallback. That is gone: there is now
 * exactly one transport, configured from `SMTP_*`, so there is one place to look
 * when mail stops arriving.
 *
 * Defaults target Gmail (`smtp.gmail.com:465`), so with a Google account the only
 * two variables that must be set are `SMTP_USER` and `SMTP_PASSWORD` — and the
 * password must be a Google **App Password** (16 characters, 2-Step Verification
 * required). Google rejects normal account passwords on SMTP.
 *
 *   SMTP_USER       full address the mail is sent from, e.g. no-reply@shewell.com
 *   SMTP_PASSWORD   Gmail App Password (or the SMTP password of another provider)
 *   FROM_EMAIL      optional; defaults to SMTP_USER
 *   MAIL_FROM_NAME  optional display name, defaults to "SheWell"
 *   SMTP_HOST       optional, defaults to smtp.gmail.com
 *   SMTP_PORT       optional, defaults to 465
 *   SMTP_SECURE     optional; inferred from the port (465 = implicit TLS)
 *
 * Failures throw. Every caller already wraps this in try/catch, so a user learns
 * the code was not sent rather than waiting for a message that never arrives.
 */

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  /** Defaults to FROM_EMAIL, then SMTP_USER. */
  from?: string;
  replyTo?: string;
};

export class MailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MailConfigError";
  }
}

export class MailSendError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "MailSendError";
  }
}

const DEFAULT_HOST = "smtp.gmail.com";
const DEFAULT_PORT = 465;
const DEFAULT_FROM_NAME = "SheWell";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

/**
 * `emptyStringAsUndefined` is applied only by the env schemas, and this package is
 * also imported from scripts that read `process.env` raw. A variable holding the
 * literal string "undefined" — the classic result of interpolating a missing value
 * — is treated the same as unset.
 */
function envValue(name: string): string | undefined {
  const raw = process.env[name];
  if (!raw) return undefined;
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return undefined;
  return trimmed;
}

function readConfig(): SmtpConfig {
  const user = envValue("SMTP_USER");
  // Gmail displays App Passwords in groups of four ("abcd efgh ijkl mnop"). Pasted
  // verbatim they still authenticate, but only because Google ignores the spaces —
  // other providers do not, so strip them here rather than debug it later.
  const pass = envValue("SMTP_PASSWORD")?.replace(/\s+/g, "");

  if (!user || !pass) {
    throw new MailConfigError(
      "Email is not configured: set SMTP_USER and SMTP_PASSWORD (a Gmail App Password for Google accounts).",
    );
  }

  const port = Number(envValue("SMTP_PORT") ?? DEFAULT_PORT);
  if (!Number.isInteger(port) || port <= 0) {
    throw new MailConfigError(
      `SMTP_PORT is not a valid port number: ${process.env.SMTP_PORT}`,
    );
  }

  const secureRaw = envValue("SMTP_SECURE");
  // 465 is implicit TLS; 587 starts plaintext and upgrades via STARTTLS.
  const secure = secureRaw ? secureRaw === "true" || secureRaw === "1" : port === 465;

  const fromAddress = envValue("FROM_EMAIL") ?? user;
  const fromName = envValue("MAIL_FROM_NAME") ?? DEFAULT_FROM_NAME;

  return {
    host: envValue("SMTP_HOST") ?? DEFAULT_HOST,
    port,
    secure,
    user,
    pass,
    // Gmail rewrites the envelope sender to the authenticated account regardless,
    // but a display name still improves how the message renders in the inbox.
    from: `${fromName} <${fromAddress}>`,
  };
}

/**
 * One transporter per configuration, reused across calls.
 *
 * Building a transporter per send means a fresh TCP + TLS handshake for every OTP,
 * which is the slowest step in the whole sign-in path. The key includes the
 * settings, so a changed variable in development takes effect without a restart.
 */
let cached: { key: string; transporter: Transporter } | null = null;

function getTransporter(config: SmtpConfig): Transporter {
  const key = `${config.host}:${config.port}:${config.secure}:${config.user}:${config.pass}`;
  if (cached?.key === key) return cached.transporter;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
    // Serverless invocations are short-lived; a hung SMTP connection must not hold
    // the request open until the platform's own timeout kills it.
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  cached = { key, transporter };
  return transporter;
}

/**
 * A caller-supplied address, or `undefined` when it is not one.
 *
 * Callers write `from: process.env.FROM_EMAIL!`. With the variable unset that is
 * `undefined`, and template-built values can arrive as the literal string
 * `"undefined"` — neither is a sender.
 */
function usableAddress(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return undefined;
  return trimmed;
}

function recipients(to: string | string[]): string[] {
  const list = (Array.isArray(to) ? to : [to])
    .map((address) => address?.trim())
    .filter(Boolean);

  if (list.length === 0) {
    throw new MailConfigError("No recipient address supplied.");
  }
  return list;
}

/**
 * Sends one message. Throws `MailConfigError` when SMTP is not configured and
 * `MailSendError` when the server rejects it — never fails silently.
 */
export const sendEmail = async (options: SendEmailOptions) => {
  const config = readConfig();
  const to = recipients(options.to);

  if (!options.html && !options.text) {
    throw new MailConfigError("Email must have an `html` or `text` body.");
  }

  try {
    const info = await getTransporter(config).sendMail({
      // A caller-supplied `from` is honoured — but callers pass
      // `process.env.FROM_EMAIL!`, which is `undefined` when unset with the `!`
      // hiding that from the type checker. Fall back to the configured sender.
      from: usableAddress(options.from) ?? config.from,
      to: to.join(", "),
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    return {
      provider: "smtp" as const,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    const detail = (error as Error)?.message ?? String(error);

    // Gmail's rejection for a plain account password is opaque enough to be worth
    // translating; it is by far the most common setup mistake.
    const hint =
      config.host.includes("gmail") &&
      /invalid login|username and password not accepted|5\.7\.\d/i.test(detail)
        ? " Gmail requires a 16-character App Password with 2-Step Verification enabled — an account password is always rejected."
        : "";

    throw new MailSendError(`Failed to send email: ${detail}${hint}`, error);
  }
};

/**
 * Opens a connection and authenticates without sending anything.
 *
 * Use it to check credentials at deploy time or from a health check, rather than
 * discovering they are wrong when someone cannot sign in.
 */
export const verifyMailTransport = async () => {
  const config = readConfig();
  try {
    await getTransporter(config).verify();
    return { ok: true as const, host: config.host, port: config.port, user: config.user };
  } catch (error) {
    throw new MailSendError(
      `SMTP verification failed: ${(error as Error)?.message ?? String(error)}`,
      error,
    );
  }
};

/** True when SMTP credentials are present. Never throws. */
export const isMailConfigured = () =>
  Boolean(envValue("SMTP_USER") && envValue("SMTP_PASSWORD"));
