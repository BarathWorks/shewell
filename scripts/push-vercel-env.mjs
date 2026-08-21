#!/usr/bin/env node
/**
 * Pushes environment variables to Vercel, one project per app.
 *
 * Each app validates its own env at build time (`src/env.js`), so a missing
 * variable fails the build rather than breaking silently at request time. This
 * script derives the full set for each app from the schemas, so nothing is missed.
 *
 * Usage:
 *   1. vercel login
 *   2. cp scripts/vercel-env.config.example.json scripts/vercel-env.config.json
 *   3. fill in the domains and Vercel project names
 *   4. node scripts/push-vercel-env.mjs --env production
 *
 * Flags:
 *   --env <production|preview|development>   default: production
 *   --app <client|doctor|admin>              default: all three
 *   --dry-run                                print what would be set, change nothing
 *   --force                                  replace variables that already exist
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONFIG_PATH = path.join(ROOT, 'scripts', 'vercel-env.config.json');

const args = process.argv.slice(2);
const flag = (name, fallback = undefined) => {
  const i = args.indexOf(`--${name}`);
  return i === -1 ? fallback : args[i + 1];
};
const has = (name) => args.includes(`--${name}`);

const TARGET_ENV = flag('env', 'production');
const ONLY_APP = flag('app');
const DRY_RUN = has('dry-run');
const FORCE = has('force');

if (!['production', 'preview', 'development'].includes(TARGET_ENV)) {
  console.error(`--env must be production, preview or development (got "${TARGET_ENV}")`);
  process.exit(1);
}

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

if (!fs.existsSync(CONFIG_PATH)) {
  console.error(
    `Missing ${path.relative(ROOT, CONFIG_PATH)}.\n` +
      'Copy scripts/vercel-env.config.example.json to it and fill in your domains.'
  );
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
const domains = config.domains ?? {};
const projects = config.vercelProjects ?? {};
const overrides = config.overrides ?? {};
const secrets = readEnvFile(path.join(ROOT, config.secretsFrom ?? 'apps/admin/.env.local'));

for (const key of ['client', 'doctor', 'admin']) {
  const d = domains[key];
  if (!d || !/^https?:\/\//.test(d) || d.endsWith('/')) {
    console.error(`domains.${key} must be a full origin with no trailing slash (got "${d ?? ''}")`);
    process.exit(1);
  }
}

/** Reads a value from the source env file, or an explicit override. */
const val = (name) => overrides[name] ?? secrets[name] ?? '';

const SHARED = (appName) => ({
  NEXT_PUBLIC_APP_NAME: appName,
  DATABASE_URL: val('DATABASE_URL'),
  DIRECT_URL: val('DIRECT_URL'),
  NEXTAUTH_SECRET: val('NEXTAUTH_SECRET'),
  NEXT_PUBLIC_USER: domains.client,
  NEXT_PUBLIC_PROFESSIONAL: domains.doctor,
  LOG_LEVEL: overrides.LOG_LEVEL ?? 'info'
});

// Mirrors each app's src/env.js — keep the two in step.
const MATRIX = {
  client: {
    project: projects.client,
    dir: 'apps/vyan-client',
    vars: {
      ...SHARED('vyan-client'),
      NEXTAUTH_URL: domains.client,
      GOOGLE_CLIENT_ID: val('GOOGLE_CLIENT_ID'),
      GOOGLE_CLIENT_SECRET: val('GOOGLE_CLIENT_SECRET'),
      RAZORPAY_KEY_SECRET: val('RAZORPAY_KEY_SECRET'),
      RAZORPAY_WEBHOOK_SECRET: val('RAZORPAY_WEBHOOK_SECRET'),
      CRON_SECRET: val('CRON_SECRET'),
      NEXT_PUBLIC_RAZORPAY_KEY_ID: val('NEXT_PUBLIC_RAZORPAY_KEY_ID') || val('RAZORPAY_KEY_ID'),
      NEXT_PUBLIC_GST: overrides.NEXT_PUBLIC_GST ?? '18',
      NEXT_PUBLIC_PLATFORM_FEE: overrides.NEXT_PUBLIC_PLATFORM_FEE ?? '10',
      SENDGRID_API_KEY: val('SENDGRID_API_KEY'),
      FROM_EMAIL: val('FROM_EMAIL')
    }
  },
  doctor: {
    project: projects.doctor,
    dir: 'apps/vyan-doctor',
    vars: {
      ...SHARED('vyan-doctor'),
      NEXTAUTH_URL: domains.doctor,
      GOOGLE_CLIENT_ID: val('GOOGLE_CLIENT_ID'),
      GOOGLE_CLIENT_SECRET: val('GOOGLE_CLIENT_SECRET'),
      RAZORPAY_KEY_SECRET: val('RAZORPAY_KEY_SECRET'),
      NEXT_PUBLIC_RAZORPAY_KEY_ID: val('NEXT_PUBLIC_RAZORPAY_KEY_ID') || val('RAZORPAY_KEY_ID'),
      NEXT_PUBLIC_PLATFORM_FEE: overrides.NEXT_PUBLIC_PLATFORM_FEE ?? '10',
      AWS_ACCESS_KEY_ID: val('AWS_ACCESS_KEY_ID'),
      AWS_SECRET_ACCESS_KEY: val('AWS_SECRET_ACCESS_KEY'),
      AWS_REGION: val('AWS_REGION'),
      AWS_BUCKET: val('AWS_BUCKET'),
      NEXT_PUBLIC_AWS_URL_PREFIX:
        val('NEXT_PUBLIC_AWS_URL_PREFIX') ||
        `https://${val('AWS_BUCKET')}.s3.${val('AWS_REGION')}.amazonaws.com`
    }
  },
  admin: {
    project: projects.admin,
    dir: 'apps/admin',
    vars: {
      ...SHARED('admin'),
      NEXTAUTH_URL: domains.admin,
      AWS_ACCESS_KEY_ID: val('AWS_ACCESS_KEY_ID'),
      AWS_SECRET_ACCESS_KEY: val('AWS_SECRET_ACCESS_KEY'),
      AWS_REGION: val('AWS_REGION'),
      AWS_BUCKET: val('AWS_BUCKET'),
      RAZORPAY_KEY_ID: val('RAZORPAY_KEY_ID'),
      RAZORPAY_KEY_SECRET: val('RAZORPAY_KEY_SECRET'),
      SENDGRID_API_KEY: val('SENDGRID_API_KEY'),
      FROM_EMAIL: val('FROM_EMAIL')
    }
  }
};

// SENTRY_DSN is optional: when absent, errors still land in Vercel Runtime Logs.
if (val('SENTRY_DSN')) {
  for (const app of Object.values(MATRIX)) app.vars.SENTRY_DSN = val('SENTRY_DSN');
}

function vercel(argv, opts = {}) {
  return spawnSync('npx', ['vercel', ...argv], {
    cwd: opts.cwd ?? ROOT,
    input: opts.input,
    encoding: 'utf8',
    shell: process.platform === 'win32'
  });
}

// Fail early rather than half-applying a config. Skipped for --dry-run, which
// only resolves and prints the matrix and never contacts Vercel.
if (!DRY_RUN) {
  const who = vercel(['whoami']);
  if (who.status !== 0) {
    console.error('Not logged in to Vercel. Run `vercel login` first.');
    process.exit(1);
  }
  console.log(`Vercel account: ${(who.stdout || '').trim().split('\n').pop()}`);
}
console.log(`Target environment: ${TARGET_ENV}${DRY_RUN ? '  (dry run)' : ''}\n`);

let failures = 0;

for (const [name, app] of Object.entries(MATRIX)) {
  if (ONLY_APP && ONLY_APP !== name) continue;

  console.log(`── ${name} → project "${app.project ?? '(unset)'}"`);
  if (!app.project) {
    console.error('   no vercelProjects entry; skipping\n');
    failures++;
    continue;
  }

  const missing = Object.entries(app.vars)
    .filter(([, v]) => v === '' || v === undefined)
    .map(([k]) => k);
  if (missing.length) {
    console.error(`   missing values: ${missing.join(', ')}`);
    console.error('   fill these into the source env file or config overrides.\n');
    failures++;
    continue;
  }

  const appDir = path.join(ROOT, app.dir);

  if (!DRY_RUN) {
    // `vercel env add` applies to whichever project the working directory is
    // linked to, so link explicitly instead of trusting a stray .vercel folder.
    const link = vercel(['link', '--yes', '--project', app.project], { cwd: appDir });
    if (link.status !== 0) {
      const msg = String(link.stderr ?? '').trim().slice(0, 200);
      console.error(`   could not link to "${app.project}": ${msg}`);
      failures++;
      continue;
    }
  }

  for (const [key, value] of Object.entries(app.vars)) {
    // NEXT_PUBLIC_* is compiled into the browser bundle and NEXTAUTH_URL is just an
    // origin, so showing them in full makes the output reviewable. Mask the rest.
    const isPublic = key.startsWith('NEXT_PUBLIC_') || key === 'NEXTAUTH_URL' || key === 'LOG_LEVEL';
    const shown = isPublic
      ? value
      : /SECRET|KEY|URL|PASSWORD|DSN|TOKEN/i.test(key)
        ? `${String(value).slice(0, 8)}…(${String(value).length} chars)`
        : value;

    if (DRY_RUN) {
      console.log(`   would set ${key} = ${shown}`);
      continue;
    }

    if (FORCE) {
      vercel(['env', 'rm', key, TARGET_ENV, '--yes'], { cwd: appDir });
    }

    const res = vercel(['env', 'add', key, TARGET_ENV], {
      input: String(value),
      cwd: appDir
    });

    if (res.status === 0) {
      console.log(`   set ${key} = ${shown}`);
    } else {
      const err = `${res.stderr ?? ''}`.trim();
      if (/already exists/i.test(err)) {
        console.log(`   skip ${key} (already set — re-run with --force to replace)`);
      } else {
        console.error(`   FAILED ${key}: ${err.split('\n')[0]}`);
        failures++;
      }
    }
  }
  console.log('');
}

if (failures) {
  console.error(`Completed with ${failures} problem(s).`);
  process.exit(1);
}
console.log(DRY_RUN ? 'Dry run complete.' : 'Done. Redeploy for the new values to take effect.');
