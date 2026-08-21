#!/usr/bin/env node
/**
 * Creates (or updates) an AdminUser.
 *
 * There is no sign-up flow for the admin app, so the first account has to be
 * seeded. Note `AdminUser.active` defaults to `false` while `authorize()` filters
 * on `active: true` — an admin created without it can never log in.
 *
 * Usage, from the repo root:
 *
 *   ADMIN_EMAIL=you@example.com ADMIN_NAME="Your Name" \
 *     node apps/admin/scripts/create-admin.cjs
 *
 * Set ADMIN_PASSWORD to choose the password; omit it and a strong one is
 * generated and printed once. Pass --reset to overwrite the password of an
 * account that already exists.
 *
 * ADMIN_ROLE picks the capability tier and defaults to SUPPORT (read-only), so a
 * mistyped invocation cannot mint an account that can move money:
 *   SUPER_ADMIN | OPERATIONS | FINANCE | CONTENT | SUPPORT
 *
 * Reads apps/admin/.env.local for DATABASE_URL.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Minimal .env reader — the admin app has no dotenv dependency and this script
// only needs DATABASE_URL. Existing environment variables win.
function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnv(path.join(__dirname, '..', '.env.local'));

const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const BCRYPT_COST = 12;

function generatePassword() {
  // Ambiguous characters removed so the password can be read off a screen safely.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  const bytes = crypto.randomBytes(24);
  let out = '';
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

async function main() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const name = (process.env.ADMIN_NAME || '').trim() || 'Administrator';
  const reset = process.argv.includes('--reset');

  const ROLES = ['SUPER_ADMIN', 'OPERATIONS', 'FINANCE', 'CONTENT', 'SUPPORT'];
  // Least privilege by default: promotion has to be deliberate.
  const role = (process.env.ADMIN_ROLE || 'SUPPORT').trim().toUpperCase();
  if (!ROLES.includes(role)) {
    console.error(`ADMIN_ROLE must be one of: ${ROLES.join(', ')} (got "${role}")`);
    process.exit(1);
  }

  if (!email) {
    console.error('ADMIN_EMAIL is required.');
    process.exit(1);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    console.error(`ADMIN_EMAIL does not look like an email address: ${email}`);
    process.exit(1);
  }

  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD || generatePassword();

  if (!generated && password.length < 12) {
    console.error('ADMIN_PASSWORD must be at least 12 characters.');
    process.exit(1);
  }

  const db = new PrismaClient();
  try {
    const existing = await db.adminUser.findUnique({ where: { email } });

    if (existing && !reset) {
      console.error(
        `An admin with ${email} already exists (active: ${existing.active}).\n` +
          'Re-run with --reset to set a new password for it.'
      );
      process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);

    const user = await db.adminUser.upsert({
      where: { email },
      update: { passwordHash, active: true, name, role },
      // `active` must be true explicitly: it defaults to false and login filters on it.
      create: { email, name, passwordHash, active: true, role }
    });

    console.log('');
    console.log(existing ? 'Admin password reset.' : 'Admin user created.');
    console.log('  id     ', user.id);
    console.log('  name   ', user.name);
    console.log('  email  ', user.email);
    console.log('  role   ', user.role);
    console.log('  active ', user.active);
    if (generated) {
      console.log('');
      console.log('  password  ' + password);
      console.log('');
      console.log('  Shown once and not stored anywhere. Save it now, then change it.');
    }
    console.log('');
  } finally {
    await db.$disconnect();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
