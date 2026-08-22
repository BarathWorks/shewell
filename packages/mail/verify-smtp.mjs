#!/usr/bin/env node
/**
 * Checks the SMTP credentials without going through the app.
 *
 * Mail failures are otherwise only visible as "we could not send your code right
 * now" at the end of a sign-in attempt, which says nothing about which of the four
 * variables is wrong. This authenticates against the server directly and, if asked,
 * sends one real message.
 *
 *   pnpm mail:verify                              # authenticate only
 *   pnpm mail:verify you@example.com              # also send a test message
 *   pnpm mail:verify --env apps/admin/.env

 * Lives in `packages/mail` rather than `scripts/` so that `nodemailer` resolves:
 * pnpm does not hoist it to the workspace root.
 *
 * Reads apps/vyan-client/.env by default. Nothing is written and no secret is
 * printed.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';

// Repo root, two levels up from packages/mail — env paths are given relative to it.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const argv = process.argv.slice(2);
const envIndex = argv.indexOf('--env');
const envFile = envIndex === -1 ? 'apps/vyan-client/.env' : argv[envIndex + 1];
const recipient = argv.find((a, i) => !a.startsWith('--') && i !== envIndex + 1);

/** Minimal .env reader — the same one `push-vercel-env.mjs` uses, kept dependency-free. */
function readEnvFile(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq === -1) continue;
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[t.slice(0, eq).trim()] = v;
  }
  return out;
}

const fileEnv = readEnvFile(path.join(ROOT, envFile));
// A value already exported in the shell wins, so this can be pointed at any config.
const get = (name) => process.env[name] || fileEnv[name] || '';

const user = get('SMTP_USER');
// Gmail shows App Passwords in groups of four; the spaces are display only.
const pass = get('SMTP_PASSWORD').replace(/\s+/g, '');
const host = get('SMTP_HOST') || 'smtp.gmail.com';
const port = Number(get('SMTP_PORT') || 465);
const fromAddress = get('FROM_EMAIL') || user;
const fromName = get('MAIL_FROM_NAME') || 'SheWell';

if (!user || !pass) {
  console.error(`SMTP_USER and SMTP_PASSWORD must both be set (looked in ${envFile}).`);
  process.exit(1);
}

console.log(`host   ${host}:${port}`);
console.log(`user   ${user}`);
console.log(`from   ${fromName} <${fromAddress}>`);
console.log(`secret ${pass.length} characters`);
console.log('');

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  connectionTimeout: 10_000,
});

try {
  await transporter.verify();
  console.log('✓ authenticated');
} catch (error) {
  console.error(`✗ authentication failed: ${error.message}`);
  if (host.includes('gmail')) {
    console.error(
      '\n  Gmail needs a 16-character App Password, not the account password:\n' +
        '  Google Account > Security > 2-Step Verification > App passwords.'
    );
  }
  process.exit(1);
}

if (!recipient) {
  console.log('\nPass an address to send a test message: node scripts/verify-smtp.mjs you@example.com');
  process.exit(0);
}

try {
  const info = await transporter.sendMail({
    from: `${fromName} <${fromAddress}>`,
    to: recipient,
    subject: 'SheWell SMTP test',
    text: 'If you are reading this, transactional email is configured correctly.',
    html: '<p>If you are reading this, transactional email is configured correctly.</p>',
  });
  console.log(`✓ sent to ${recipient} (${info.messageId})`);
} catch (error) {
  console.error(`✗ send failed: ${error.message}`);
  process.exit(1);
}
