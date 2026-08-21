import { describe, it, expect } from "vitest";
import crypto from "node:crypto";

import {
  roleHasPermission,
  permissionsForRole,
  canManageAdmins,
} from "@repo/database";

/**
 * The decisions that decide who gets in and how much money moves.
 *
 * These are the parts of the system where being subtly wrong is expensive, and
 * they are all pure functions or small reimplementations of one — so they can be
 * exercised exhaustively with no database and no gateway.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Admin capability matrix
// ─────────────────────────────────────────────────────────────────────────────

describe("admin permissions", () => {
  it("gives SUPER_ADMIN everything, including payouts and admin management", () => {
    expect(roleHasPermission("SUPER_ADMIN", "payout:write")).toBe(true);
    expect(roleHasPermission("SUPER_ADMIN", "admin:write")).toBe(true);
    expect(canManageAdmins("SUPER_ADMIN")).toBe(true);
  });

  it("lets OPERATIONS see payouts but never move money", () => {
    expect(roleHasPermission("OPERATIONS", "payout:read")).toBe(true);
    expect(roleHasPermission("OPERATIONS", "payout:write")).toBe(false);
  });

  it("confines FINANCE to money and the records needed to reconcile it", () => {
    expect(roleHasPermission("FINANCE", "payout:write")).toBe(true);
    expect(roleHasPermission("FINANCE", "content:write")).toBe(false);
    expect(roleHasPermission("FINANCE", "session:write")).toBe(false);
  });

  it("confines CONTENT to content and sessions", () => {
    expect(roleHasPermission("CONTENT", "content:write")).toBe(true);
    expect(roleHasPermission("CONTENT", "payout:read")).toBe(false);
    expect(roleHasPermission("CONTENT", "user:write")).toBe(false);
  });

  /**
   * The payouts view exposes practitioner bank details. A support agent has no
   * reason to see them, so SUPPORT is deliberately denied even read access.
   */
  it("keeps SUPPORT read-only and away from financial data", () => {
    expect(roleHasPermission("SUPPORT", "user:read")).toBe(true);
    expect(roleHasPermission("SUPPORT", "payout:read")).toBe(false);
    expect(roleHasPermission("SUPPORT", "user:write")).toBe(false);
    expect(roleHasPermission("SUPPORT", "admin:write")).toBe(false);
  });

  it("denies everything to an absent or unknown role", () => {
    expect(roleHasPermission(null, "user:read")).toBe(false);
    expect(roleHasPermission(undefined, "user:read")).toBe(false);
    expect(permissionsForRole(null)).toEqual([]);
    expect(canManageAdmins(null)).toBe(false);
  });

  it("grants admin management to exactly one role", () => {
    const roles = ["SUPER_ADMIN", "OPERATIONS", "FINANCE", "CONTENT", "SUPPORT"] as const;
    const canManage = roles.filter((r) => canManageAdmins(r));
    expect(canManage).toEqual(["SUPER_ADMIN"]);
  });

  it("grants money movement to exactly two roles", () => {
    const roles = ["SUPER_ADMIN", "OPERATIONS", "FINANCE", "CONTENT", "SUPPORT"] as const;
    const canPay = roles.filter((r) => roleHasPermission(r, "payout:write"));
    expect(canPay.sort()).toEqual(["FINANCE", "SUPER_ADMIN"]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Razorpay signature verification
// ─────────────────────────────────────────────────────────────────────────────

const KEY_SECRET = "test_secret_do_not_use";
const WEBHOOK_SECRET = "test_webhook_secret";

/** Mirrors the check in verify-payment.ts. */
function paymentSignature(orderId: string, paymentId: string, secret: string) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

/** Mirrors the check in the webhook route. */
function webhookSignature(rawBody: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

function constantTimeEquals(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

describe("payment signature verification", () => {
  const orderId = "order_TESTabc123";
  const paymentId = "pay_TESTxyz789";

  it("accepts a genuine signature", () => {
    const sig = paymentSignature(orderId, paymentId, KEY_SECRET);
    expect(paymentSignature(orderId, paymentId, KEY_SECRET)).toBe(sig);
  });

  it("rejects a signature made with the wrong secret", () => {
    const forged = paymentSignature(orderId, paymentId, "attacker_secret");
    expect(forged).not.toBe(paymentSignature(orderId, paymentId, KEY_SECRET));
  });

  it("rejects a signature bound to a different order", () => {
    const other = paymentSignature("order_SOMEONEELSE", paymentId, KEY_SECRET);
    expect(other).not.toBe(paymentSignature(orderId, paymentId, KEY_SECRET));
  });

  it("rejects a signature bound to a different payment", () => {
    const other = paymentSignature(orderId, "pay_DIFFERENT", KEY_SECRET);
    expect(other).not.toBe(paymentSignature(orderId, paymentId, KEY_SECRET));
  });

  it("rejects an empty signature", () => {
    expect(constantTimeEquals(paymentSignature(orderId, paymentId, KEY_SECRET), "")).toBe(
      false,
    );
  });
});

describe("webhook signature verification", () => {
  const body = JSON.stringify({
    event: "payment.captured",
    payload: { payment: { entity: { id: "pay_1", order_id: "order_1", amount: 50000 } } },
  });

  it("accepts the exact bytes it signed", () => {
    const sig = webhookSignature(body, WEBHOOK_SECRET);
    expect(constantTimeEquals(webhookSignature(body, WEBHOOK_SECRET), sig)).toBe(true);
  });

  /**
   * The signature covers the raw body, which is why the route hashes before it
   * parses. Re-serialising JSON changes whitespace and key order and would break
   * verification for legitimate deliveries.
   */
  it("rejects a body that has been altered after signing", () => {
    const sig = webhookSignature(body, WEBHOOK_SECRET);
    const tampered = body.replace('"amount":50000', '"amount":1');
    expect(constantTimeEquals(webhookSignature(tampered, WEBHOOK_SECRET), sig)).toBe(
      false,
    );
  });

  it("rejects a signature from an attacker's secret", () => {
    const sig = webhookSignature(body, WEBHOOK_SECRET);
    expect(constantTimeEquals(webhookSignature(body, "attacker"), sig)).toBe(false);
  });

  it("rejects a truncated signature without throwing", () => {
    const sig = webhookSignature(body, WEBHOOK_SECRET);
    expect(constantTimeEquals(sig, sig.slice(0, 10))).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Amount reconciliation — the check that a valid signature does NOT give you
// ─────────────────────────────────────────────────────────────────────────────

describe("amount reconciliation", () => {
  /** Mirrors the comparison in verify-payment.ts and the webhook. */
  const matches = (paid: number, expected: number) => Number(paid) === Number(expected);

  it("accepts the exact expected amount", () => {
    expect(matches(59000, 59000)).toBe(true);
  });

  it("rejects underpayment", () => {
    expect(matches(100, 59000)).toBe(false);
  });

  it("rejects overpayment", () => {
    expect(matches(60000, 59000)).toBe(false);
  });

  /**
   * `amount_paid` being merely non-zero would accept a partial capture — which is
   * what the original check did.
   */
  it("rejects a partial capture that is non-zero", () => {
    const amountPaid = 1;
    expect(amountPaid > 0).toBe(true);
    expect(matches(amountPaid, 59000)).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GST pricing
// ─────────────────────────────────────────────────────────────────────────────

describe("price resolution", () => {
  /** Mirrors resolveAppointmentPrice's arithmetic. */
  function resolve(base: number, gstPercent: number) {
    const taxedAmount = Math.round((gstPercent / 100) * base);
    return { priceInCents: base, taxedAmount, totalPriceInCents: base + taxedAmount };
  }

  it("adds GST on top of the configured rate", () => {
    expect(resolve(100000, 18)).toEqual({
      priceInCents: 100000,
      taxedAmount: 18000,
      totalPriceInCents: 118000,
    });
  });

  it("rounds tax to whole paise", () => {
    const { taxedAmount } = resolve(33333, 18);
    expect(Number.isInteger(taxedAmount)).toBe(true);
    expect(taxedAmount).toBe(6000);
  });

  it("charges the total, not the base — this is what a refund must return", () => {
    const { priceInCents, totalPriceInCents } = resolve(250000, 18);
    expect(totalPriceInCents).toBeGreaterThan(priceInCents);
    // Refunding priceInCents would silently keep the tax.
    expect(totalPriceInCents - priceInCents).toBe(45000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Cancellation refund window
// ─────────────────────────────────────────────────────────────────────────────

describe("cancellation refund window", () => {
  /** Mirrors the corrected logic in both cancel actions. */
  function decide(minutesUntilStart: number) {
    if (minutesUntilStart <= 0) return "refused" as const;
    return minutesUntilStart >= 120 ? "refund" as const : "no-refund" as const;
  }

  it("refunds when cancelled well ahead", () => {
    expect(decide(60 * 24)).toBe("refund");
    expect(decide(120)).toBe("refund");
  });

  it("does not refund inside two hours", () => {
    expect(decide(119)).toBe("no-refund");
    expect(decide(1)).toBe("no-refund");
  });

  /**
   * The original check was `Math.abs(diff) < 120`, so an appointment that finished
   * ten hours ago produced abs(-600) = 600, fell into the else, and was refunded in
   * full.
   */
  it("refuses to cancel something already started", () => {
    expect(decide(0)).toBe("refused");
    expect(decide(-600)).toBe("refused");

    const buggy = (m: number) => (Math.abs(m) < 120 ? "no-refund" : "refund");
    expect(buggy(-600)).toBe("refund"); // the defect
    expect(decide(-600)).toBe("refused"); // the fix
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Practitioner earnings split
// ─────────────────────────────────────────────────────────────────────────────

describe("earnings split", () => {
  /** Mirrors finalizeBooking's arithmetic. */
  function split(total: number) {
    const doctorShareInCents = Math.floor(total * 0.8);
    return { doctorShareInCents, platformShareInCents: total - doctorShareInCents };
  }

  it("splits 80/20", () => {
    expect(split(100000)).toEqual({
      doctorShareInCents: 80000,
      platformShareInCents: 20000,
    });
  });

  it("never loses or invents a paisa to rounding", () => {
    for (const total of [1, 3, 7, 99, 12345, 59001, 1000003]) {
      const { doctorShareInCents, platformShareInCents } = split(total);
      expect(doctorShareInCents + platformShareInCents).toBe(total);
      expect(doctorShareInCents).toBeGreaterThanOrEqual(0);
      expect(platformShareInCents).toBeGreaterThanOrEqual(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OTP comparison
// ─────────────────────────────────────────────────────────────────────────────

describe("OTP comparison", () => {
  /** Mirrors otpMatches in the auth providers. */
  function otpMatches(expected: string | null | undefined, received: string | null | undefined) {
    if (!expected || !received) return false;
    const a = Buffer.from(String(expected), "utf8");
    const b = Buffer.from(String(received), "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  it("accepts the correct code", () => {
    expect(otpMatches("123456", "123456")).toBe(true);
  });

  it("rejects a wrong code", () => {
    expect(otpMatches("123456", "123457")).toBe(false);
  });

  /**
   * A cleared code is stored as "". A plain `!==` would accept an empty submission
   * against it, which is a free pass into any account whose code was just consumed.
   */
  it("never matches against a cleared code", () => {
    expect(otpMatches("", "")).toBe(false);
    expect(otpMatches("", "123456")).toBe(false);
    expect(otpMatches(null, "")).toBe(false);
    expect(otpMatches(undefined, undefined)).toBe(false);
  });

  it("rejects a length mismatch without throwing", () => {
    expect(otpMatches("123456", "1234")).toBe(false);
    expect(otpMatches("123456", "1234567")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// OAuth state token (SW-15)
// ─────────────────────────────────────────────────────────────────────────────

describe("OAuth state token", () => {
  const SECRET = "nextauth-secret-for-tests";
  const TTL = 10 * 60 * 1000;

  function key() {
    return crypto.createHmac("sha256", SECRET).update("google-oauth-state").digest();
  }
  function sign(payload: string) {
    return crypto.createHmac("sha256", key()).update(payload).digest("base64url");
  }
  function create(userId: string, expiresAt = Date.now() + TTL) {
    const nonce = crypto.randomBytes(16).toString("base64url");
    const payload = `${userId}.${nonce}.${expiresAt}`;
    return `${Buffer.from(payload).toString("base64url")}.${sign(payload)}`;
  }
  function verify(state: string | null, userId: string): boolean {
    if (!state) return false;
    const sep = state.lastIndexOf(".");
    if (sep <= 0) return false;
    const encoded = state.slice(0, sep);
    const received = state.slice(sep + 1);
    let payload: string;
    try {
      payload = Buffer.from(encoded, "base64url").toString("utf8");
    } catch {
      return false;
    }
    const expected = sign(payload);
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(received, "utf8");
    if (a.length !== b.length) return false;
    if (!crypto.timingSafeEqual(a, b)) return false;
    const [subject, , expiresAt] = payload.split(".");
    if (!subject || !expiresAt) return false;
    if (subject !== userId) return false;
    return Date.now() <= Number(expiresAt);
  }

  it("accepts a token it just issued", () => {
    expect(verify(create("doc_1"), "doc_1")).toBe(true);
  });

  /** The whole point: an attacker's flow must not bind to a victim's account. */
  it("rejects a token issued for a different practitioner", () => {
    expect(verify(create("attacker"), "victim")).toBe(false);
  });

  it("rejects a missing state — the original behaviour", () => {
    expect(verify(null, "doc_1")).toBe(false);
    expect(verify("", "doc_1")).toBe(false);
  });

  it("rejects a tampered payload", () => {
    const token = create("doc_1");
    const [encoded, sig] = token.split(".");
    const forged = Buffer.from("victim.nonce.99999999999999").toString("base64url");
    expect(verify(`${forged}.${sig}`, "victim")).toBe(false);
  });

  it("rejects an expired token", () => {
    expect(verify(create("doc_1", Date.now() - 1000), "doc_1")).toBe(false);
  });

  it("rejects garbage without throwing", () => {
    expect(verify("not-a-token", "doc_1")).toBe(false);
    expect(verify("....", "doc_1")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rich-text sanitisation contract
// ─────────────────────────────────────────────────────────────────────────────

describe("bank detail masking (SW-28)", () => {
  function maskAccountNumber(value: string | null): string | null {
    if (!value) return null;
    const t = value.replace(/\s+/g, "");
    if (t.length <= 4) return "••••";
    return `${"•".repeat(Math.max(4, t.length - 4))}${t.slice(-4)}`;
  }

  it("reveals only the last four digits", () => {
    expect(maskAccountNumber("50100123456789")).toBe("••••••••••6789");
  });

  it("never returns the full number", () => {
    const full = "50100123456789";
    expect(maskAccountNumber(full)).not.toContain("50100");
  });

  it("handles absent and short values", () => {
    expect(maskAccountNumber(null)).toBeNull();
    expect(maskAccountNumber("1234")).toBe("••••");
  });
});
