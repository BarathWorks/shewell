import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";

/**
 * Transactional email.
 *
 * This module previously built a Gmail SMTP transport from `GMAIL_USER` and
 * `GMAIL_APP_PASSWORD` — two variables that are declared in no env schema and set
 * in no env file. Worse, `sendEmail` caught every failure and returned
 * `undefined`, so all sixteen call sites believed the send had succeeded.
 *
 * The visible effect was that registration OTPs, login OTPs, password-reset links
 * and payment confirmations were never delivered, and nothing anywhere reported a
 * problem. One caller even names its payload `emailBodySendGrid`, which is what
 * the intent had been: `@sendgrid/mail` is already a dependency and
 * `SENDGRID_API_KEY` is configured in every app.
 *
 * Two changes:
 *   - SendGrid is the transport, with Gmail SMTP kept as an explicit fallback for
 *     anyone who has those variables set.
 *   - Failures throw. Every caller already wraps this in try/catch and returns a
 *     real error, so a user now learns the code was not sent instead of waiting
 *     for a message that was never going to arrive.
 */

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  /** Defaults to FROM_EMAIL. Must be a verified sender on the SendGrid account. */
  from?: string;
};

export class MailConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MailConfigError";
  }
}

export class MailSendError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "MailSendError";
  }
}

function resolveFrom(explicit?: string): string {
  const from = explicit ?? process.env.FROM_EMAIL;
  if (!from) {
    throw new MailConfigError(
      "No sender address: pass `from`, or set FROM_EMAIL."
    );
  }
  return from;
}

function recipients(to: string | string[]): string[] {
  const list = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (list.length === 0) {
    throw new MailConfigError("No recipient address supplied.");
  }
  return list;
}

async function sendViaSendGrid(options: SendEmailOptions, apiKey: string) {
  sgMail.setApiKey(apiKey);
  const [response] = await sgMail.send({
    to: recipients(options.to),
    from: resolveFrom(options.from),
    subject: options.subject,
    // SendGrid rejects a message with neither body.
    html: options.html,
    text: options.text ?? (options.html ? undefined : options.subject),
  } as Parameters<typeof sgMail.send>[0]);

  return { provider: "sendgrid" as const, statusCode: response?.statusCode };
}

async function sendViaGmail(options: SendEmailOptions, user: string, pass: string) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const info = await transporter.sendMail({
    to: recipients(options.to).join(","),
    from: resolveFrom(options.from),
    subject: options.subject,
    html: options.html,
    text: options.text,
  });

  return { provider: "gmail" as const, messageId: info.messageId };
}

/**
 * Sends one message. Throws `MailConfigError` if no transport is configured and
 * `MailSendError` if the provider rejects it — never fails silently.
 */
export const sendEmail = async (options: SendEmailOptions) => {
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!sendgridKey && !(gmailUser && gmailPass)) {
    throw new MailConfigError(
      "Email is not configured: set SENDGRID_API_KEY, or both GMAIL_USER and GMAIL_APP_PASSWORD."
    );
  }

  try {
    if (sendgridKey) {
      return await sendViaSendGrid(options, sendgridKey);
    }
    return await sendViaGmail(options, gmailUser!, gmailPass!);
  } catch (error) {
    // Surface the provider's own reason — SendGrid returns the useful detail in
    // a nested response body that is otherwise lost.
    const detail =
      (error as { response?: { body?: unknown } })?.response?.body ??
      (error as Error)?.message ??
      error;

    throw new MailSendError(
      `Failed to send email: ${typeof detail === "string" ? detail : JSON.stringify(detail)}`,
      error
    );
  }
};
