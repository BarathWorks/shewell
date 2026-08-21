import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Standing guards over the security properties of the source tree.
 *
 * Every defect these assert against was real and shipped. The audit found them by
 * reading; these keep them found. They need no database, no network and no build,
 * so they run on every push in a couple of seconds — which is the only reason they
 * will still be running in six months.
 *
 * The rule for adding to this file: assert the *property*, not the fix. "No server
 * action loads a session without checking it" survives refactoring; "line 34 of
 * cancel-appointment.ts contains an if statement" does not.
 */

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);

const APPS = ["vyan-client", "vyan-doctor", "admin"] as const;

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function sourceFiles(app?: string): string[] {
  if (app) return walk(path.join(ROOT, "apps", app, "src"));
  return APPS.flatMap((a) => walk(path.join(ROOT, "apps", a, "src")));
}

const rel = (f: string) => path.relative(ROOT, f).replace(/\\/g, "/");

/** Strips comments, so an assertion cannot be satisfied — or tripped — by prose. */
function code(file: string): string {
  return fs
    .readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((l) => !/^\s*(\/\/|\*)/.test(l))
    .join("\n");
}

/** True when the file's first real statement is the "use server" directive. */
function isServerActionModule(file: string): boolean {
  const first = fs
    .readFileSync(file, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith("//") && !l.startsWith("*") && !l.startsWith("/*"));
  return first === '"use server";' || first === "'use server';";
}

describe("server actions", () => {
  /**
   * SW-01: the practitioner cancel action fetched a session into a variable it
   * never read, and refunded any appointment id it was handed — with no cookie.
   */
  it("never load a session without checking it", () => {
    const offenders = sourceFiles()
      .filter(isServerActionModule)
      .filter((f) => {
        const src = code(f);
        if (!/getServerAuthSession\(\)/.test(src)) return false;
        return !/if\s*\(\s*!\s*session|session\?\.\s*user\?\.\s*id|!session\?\./.test(
          src,
        );
      })
      .map(rel);

    expect(offenders).toEqual([]);
  });

  /**
   * SW-04: `book-appointment-user-action.ts` was imported by nothing, but every
   * export of a "use server" module is a live HTTP endpoint regardless. It took the
   * price from the request and never contacted the payment gateway.
   */
  it("are all reachable from the UI (no orphaned endpoints)", () => {
    const actions = sourceFiles().filter(isServerActionModule);
    const allSource = sourceFiles()
      .map((f) => fs.readFileSync(f, "utf8"))
      .join("\n");

    const orphans = actions
      .filter((f) => {
        const base = path.basename(f).replace(/\.tsx?$/, "");
        // Referenced by import path, anywhere in the tree.
        return !new RegExp(`["'\`][^"'\`]*${base}["'\`]`).test(allSource);
      })
      .map(rel);

    expect(orphans).toEqual([]);
  });
});

describe("ownership scoping", () => {
  /**
   * SW-01 / SW-05 / SW-07: the same defect three times — an ownership filter
   * commented out during debugging and never restored.
   */
  it("has no commented-out ownership filters", () => {
    const offenders: string[] = [];

    for (const file of sourceFiles()) {
      const lines = fs.readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (/^\s*\/\/\s*(professionalUserId|userId|doctorId|patientId)\s*:/.test(line)) {
          offenders.push(`${rel(file)}:${i + 1}`);
        }
      });
    }

    // What this must catch is a *live query with its scope disabled* — not a
    // commented-out function parameter, and not a wholly commented-out block of
    // dead code. Both of those exist in this tree and neither is a security issue.
    //
    // The discriminator: walk backwards from the commented line to whichever comes
    // first, an uncommented `where` or an uncommented `(`. A `where` means the
    // disabled filter sits in a Prisma filter object; a `(` means it is a parameter
    // list.
    const live = offenders.filter((o) => {
      const idx = o.lastIndexOf(":");
      const file = o.slice(0, idx);
      const lineNo = Number(o.slice(idx + 1));
      const lines = fs.readFileSync(path.join(ROOT, file), "utf8").split("\n");

      for (let i = lineNo - 2; i >= 0 && i > lineNo - 12; i--) {
        const line = lines[i] ?? "";
        if (/^\s*(\/\/|\*)/.test(line)) continue; // skip other comments
        if (/\bwhere\s*:/.test(line)) return true; // inside a filter — a real finding
        if (/\(\s*$|\(\s*\{?\s*$/.test(line)) return false; // a parameter list
      }
      return false;
    });

    expect(live).toEqual([]);
  });
});

describe("data exposure", () => {
  /**
   * SW-06: a router returned an unselected `professionalUser` row, shipping the
   * practitioner's bcrypt hash and Google refresh token to the browser.
   */
  const FORBIDDEN_IN_SELECT = [
    "passwordHash",
    "googleAccessToken",
    "googleRefreshToken",
    "bankAccountNumber",
    "bankIfscCode",
    "aadhaarNumber",
    "panNumber",
    "otp",
  ];

  it("never select credential or identity fields in a tRPC router", () => {
    const routers = APPS.flatMap((a) =>
      walk(path.join(ROOT, "apps", a, "src", "server", "api", "routers")),
    );

    const offenders: string[] = [];
    for (const file of routers) {
      const src = code(file);

      // A module that runs every row through `maskBankDetails` has to select the
      // columns in order to mask them — that is what it is for. Exempt the bank
      // fields there, and only there, and only those two.
      const masks = /maskBankDetails/.test(src);

      for (const field of FORBIDDEN_IN_SELECT) {
        const isBankField =
          field === "bankAccountNumber" || field === "bankIfscCode";
        if (masks && isBankField) continue;
        if (new RegExp(`\\b${field}\\s*:\\s*true`).test(src)) {
          offenders.push(`${rel(file)} selects ${field}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  /**
   * Also SW-06: `include` and a bare `findMany` return every column, so a new
   * sensitive field on the model leaks the day it is added. Routers that touch
   * ProfessionalUser must name their columns.
   */
  it("never `include` the practitioner model in a router", () => {
    const routers = APPS.flatMap((a) =>
      walk(path.join(ROOT, "apps", a, "src", "server", "api", "routers")),
    );

    const offenders = routers
      .filter((f) => /include\s*:\s*\{[^}]*professionalUser\s*:\s*true/s.test(code(f)))
      .map(rel);

    expect(offenders).toEqual([]);
  });

  /**
   * SW-08: the paid session's join link was selected in a public procedure and
   * passed to a client component for every visitor.
   */
  it("does not select meetingLink unconditionally in the session router", () => {
    const file = path.join(
      ROOT,
      "apps/vyan-client/src/server/api/routers/session.ts",
    );
    const src = code(file);

    // The only permitted occurrence is inside the gated second query.
    const selects = src.match(/meetingLink\s*:\s*true/g) ?? [];
    expect(selects.length).toBeLessThanOrEqual(1);

    // ...and it must sit behind the paid check.
    if (selects.length === 1) {
      const gateIdx = src.indexOf("hasPaid");
      const selectIdx = src.indexOf("meetingLink: true");
      expect(gateIdx).toBeGreaterThan(-1);
      expect(selectIdx).toBeGreaterThan(gateIdx);
    }
  });
});

describe("payment integrity", () => {
  const clientSrc = (p: string) =>
    code(path.join(ROOT, "apps/vyan-client/src", p));

  /** SW-13: an order created inside a transaction can be orphaned by a rollback. */
  it("creates the Razorpay order outside any database transaction", () => {
    const src = clientSrc("app/actions/checkout-action.ts");
    // No `orders.create` reachable from a `tx` handle.
    expect(/tx\s*\.[\s\S]{0,200}orders\.create/.test(src)).toBe(false);
    expect(src).toMatch(/orders\.create/);
  });

  /** SW-12: both confirmation paths must run the same finalisation. */
  it("confirms payments through one shared path", () => {
    const webhook = clientSrc("app/api/webhook/razorpay/route.ts");
    const verify = clientSrc("app/actions/verify-payment.ts");
    expect(webhook).toMatch(/finalizeBooking\(/);
    expect(verify).toMatch(/finalizeBooking\(/);
  });

  /** The webhook must still prove the callback is genuine and for the right sum. */
  it("verifies webhook signature and amount", () => {
    const webhook = clientSrc("app/api/webhook/razorpay/route.ts");
    expect(webhook).toMatch(/timingSafeEqual/);
    expect(webhook).toMatch(/RAZORPAY_WEBHOOK_SECRET/);
    expect(webhook).toMatch(/amountPaid/);
  });

  /** Prices must never come from the request. */
  it("resolves appointment prices server-side only", () => {
    const pricing = clientSrc("lib/pricing.ts");
    expect(pricing).toMatch(/professionalUserAppointmentPrice/);

    const checkout = clientSrc("app/actions/checkout-action.ts");
    expect(checkout).toMatch(/resolveAppointmentPrice/);
    // The client-supplied money fields must not reach the created row.
    expect(/priceInCents:\s*serviceMode\./.test(checkout)).toBe(false);
  });

  /** SW-18: refunds must return what was charged, tax included. */
  it("refunds the taxed total, not the pre-tax base", () => {
    for (const f of [
      "apps/vyan-client/src/app/actions/cancel-appointment.ts",
      "apps/vyan-doctor/src/app/actions/cancel-appointment.ts",
    ]) {
      const src = code(path.join(ROOT, f));
      expect(src, f).toMatch(/totalPriceInCents\s*\?\?\s*[\w.]*priceInCents/);
    }
  });
});

describe("authentication hardening", () => {
  /** SW-14: every credential endpoint gets an attempt budget. */
  it("rate-limits every sign-in provider", () => {
    for (const app of APPS) {
      const authFile = path.join(ROOT, "apps", app, "src/server/auth.ts");
      const src = code(authFile);
      expect(src, `${app} auth.ts`).toMatch(/consumeRateLimit/);
    }
  });

  /** SW-14: and every account-creation endpoint. */
  it("rate-limits every registration endpoint", () => {
    const registrations = sourceFiles()
      .filter(isServerActionModule)
      .filter((f) => /\.(user|adminUser|professionalUser)\.create\(/.test(code(f)));

    const unlimited = registrations
      .filter((f) => {
        const src = code(f);
        if (/consumeRateLimit/.test(src)) return false;
        // Creating an administrator is gated on the `admin:write` capability,
        // which is a stronger control than an attempt budget: the endpoint is not
        // reachable at all without an existing privileged session. Public sign-up
        // has no such gate, which is precisely why it needs the limit.
        if (/requireAdminSession\(|requireAdmin\(|guardAdmin\(/.test(src)) return false;
        return true;
      })
      .map(rel);

    expect(unlimited).toEqual([]);
  });

  /** SW-15: the OAuth flow needs a state parameter on both legs. */
  it("uses a state parameter for Google OAuth", () => {
    const start = code(
      path.join(ROOT, "apps/vyan-doctor/src/app/api/google-meet-auth/route.ts"),
    );
    const cb = code(
      path.join(
        ROOT,
        "apps/vyan-doctor/src/app/api/google-meet-auth/callback/route.ts",
      ),
    );
    expect(start).toMatch(/state\s*:/);
    expect(cb).toMatch(/verifyOAuthState/);
  });

  /** SW-15: an authorization code in the log is a live credential in the log. */
  it("never logs an OAuth authorization code", () => {
    const cb = code(
      path.join(
        ROOT,
        "apps/vyan-doctor/src/app/api/google-meet-auth/callback/route.ts",
      ),
    );
    expect(/console\.log\(\s*["'`]code/.test(cb)).toBe(false);
  });
});

describe("configuration", () => {
  /** SW-24: a CSP is the control that bounds injected script. */
  it("sets a Content-Security-Policy in every app", () => {
    for (const app of APPS) {
      const dir = path.join(ROOT, "apps", app);
      const cfg = ["next.config.js", "next.config.mjs"]
        .map((f) => path.join(dir, f))
        .find(fs.existsSync);
      expect(cfg, `${app} next config`).toBeDefined();
      const src = fs.readFileSync(cfg!, "utf8");
      expect(src, `${app} CSP`).toMatch(/Content-Security-Policy/);
      expect(src, `${app} frame-ancestors`).toMatch(/frame-ancestors/);
      expect(src, `${app} object-src`).toMatch(/object-src 'none'/);
    }
  });

  /** SW-21: patient data must not reach the platform log through console calls. */
  it("strips console output from production bundles in every app", () => {
    for (const app of APPS) {
      const dir = path.join(ROOT, "apps", app);
      const cfg = ["next.config.js", "next.config.mjs"]
        .map((f) => path.join(dir, f))
        .find(fs.existsSync);
      const src = fs.readFileSync(cfg!, "utf8");
      expect(src, `${app} removeConsole`).toMatch(/removeConsole/);
    }
  });

  /** SW-22: a missing secret should fail the build, not the first request. */
  it("validates environment variables at build time in every app", () => {
    for (const app of APPS) {
      const dir = path.join(ROOT, "apps", app);
      const cfg = ["next.config.js", "next.config.mjs"]
        .map((f) => path.join(dir, f))
        .find(fs.existsSync);
      const src = fs.readFileSync(cfg!, "utf8");
      expect(src, `${app} env validation`).toMatch(/env\.js/);
    }
  });

  /** SW-23: an explicit NEXTAUTH_URL must beat the per-deployment Vercel host. */
  it("prefers an explicit NEXTAUTH_URL over VERCEL_URL", () => {
    for (const app of APPS) {
      // Comment-stripped: the fix documents the old pattern in prose, and reading
      // the raw file matched that prose rather than the code.
      const src = code(path.join(ROOT, "apps", app, "src/env.js"));
      expect(
        /process\.env\.VERCEL_URL\s*\?\?\s*str/.test(src),
        `${app} env.js still prefers VERCEL_URL`,
      ).toBe(false);
    }
  });

  /** SW-17: a credential in the repository is a credential everyone has. */
  it("has no hardcoded password in the seed script", () => {
    const seed = code(
      path.join(ROOT, "packages/database/prisma/seed-admin.ts"),
    );
    expect(/hash\(\s*["'`][^"'`]+["'`]/.test(seed)).toBe(false);
    expect(seed).toMatch(/SEED_ADMIN_PASSWORD/);
  });

  /** SW-16: the pattern that was supposed to stop this had a trailing slash. */
  it("ignores csv exports", () => {
    const gi = fs.readFileSync(path.join(ROOT, ".gitignore"), "utf8");
    expect(gi).toMatch(/^\*\.csv$/m);
  });
});
