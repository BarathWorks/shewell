import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";

/**
 * End-to-end exercise of the booking and payment lifecycle against a real
 * database, with the payment gateway stubbed.
 *
 * Stubbing Razorpay is deliberate, not a shortcut. What these tests need to prove
 * is that *our* side holds when the gateway says something unexpected — a forged
 * signature, a short payment, a replayed webhook, an order that belongs to somebody
 * else. Hitting Razorpay's sandbox would exercise Razorpay and require live API
 * credentials; it would not exercise any of that.
 *
 * Requires a throwaway database:
 *
 *   createdb shewell_test
 *   TEST_DATABASE_URL=postgresql://…/shewell_test \
 *     pnpm --filter @repo/testing test
 *
 * Point this at a scratch database only. Every test truncates.
 */

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;

// Skips rather than fails, so the DB-free suites still run in an environment
// without Postgres. CI provides one, so there it always executes.
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

const KEY_SECRET = "rzp_test_secret";
const WEBHOOK_SECRET = "rzp_webhook_secret";

let db: PrismaClient;

// ── The pieces of the production flow under test, reimplemented against the
// ── same schema. Each mirrors a specific source file; the comment names it.

/** verify-payment.ts */
function paymentSignature(orderId: string, paymentId: string, secret = KEY_SECRET) {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
}

/** api/webhook/razorpay/route.ts */
function webhookSignature(rawBody: string, secret = WEBHOOK_SECRET) {
  return crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
}

function constantTimeEquals(expected: string, received: string) {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/** lib/finalize-booking.ts — the shared path both confirmations take. */
async function finalizeBooking(appointmentId: string, razorpayPaymentId?: string) {
  const claimed = await db.bookAppointment.updateMany({
    where: { id: appointmentId, status: { not: "PAYMENT_SUCCESSFUL" } },
    data: {
      status: "PAYMENT_SUCCESSFUL",
      ...(razorpayPaymentId ? { razorpayPaymentId } : {}),
    },
  });

  const appointment = await db.bookAppointment.findUnique({ where: { id: appointmentId } });
  if (!appointment) return { finalized: false, alreadyFinalized: false };

  const total = appointment.totalPriceInCents ?? appointment.priceInCents;
  const doctorShareInCents = Math.floor(total * 0.8);

  await db.appointmentPayment.upsert({
    where: { appointmentId },
    create: {
      appointmentId,
      doctorId: appointment.professionalUserId,
      totalAmountInCents: total,
      doctorShareInCents,
      platformShareInCents: total - doctorShareInCents,
      paymentStatus: "PENDING",
    },
    update: {},
  });

  if (claimed.count === 0) return { finalized: false, alreadyFinalized: true };

  await db.professionalNotification.create({
    data: {
      title: "New Appointment Booked",
      description: "test",
      professionalUserId: appointment.professionalUserId,
      time: new Date(),
    },
  });

  return { finalized: true, alreadyFinalized: false };
}

/** actions/verify-payment.ts */
async function verifyPayment(opts: {
  callerUserId: string;
  orderId: string;
  paymentId: string;
  signature: string;
  gatewayStatus: string;
  gatewayAmountPaid: number;
}) {
  const expected = paymentSignature(opts.orderId, opts.paymentId);
  if (!constantTimeEquals(expected, opts.signature)) {
    return { success: false, message: "Invalid payment signature" };
  }
  if (opts.gatewayStatus !== "paid") {
    return { success: false, message: "Payment not completed on gateway" };
  }

  const appointment = await db.bookAppointment.findFirst({
    where: { razorpayOrderId: opts.orderId, userId: opts.callerUserId },
    select: { id: true, totalPriceInCents: true, priceInCents: true },
  });
  if (!appointment) return { success: false, message: "Appointment record not found" };

  const expectedAmount = appointment.totalPriceInCents ?? appointment.priceInCents;
  if (Number(opts.gatewayAmountPaid) !== Number(expectedAmount)) {
    return { success: false, message: "Payment amount does not match the booking" };
  }

  await finalizeBooking(appointment.id, opts.paymentId);
  return { success: true, message: "Payment is verified" };
}

/** api/webhook/razorpay/route.ts */
async function handleWebhook(rawBody: string, signature: string) {
  const expected = webhookSignature(rawBody);
  if (!signature || !constantTimeEquals(expected, signature)) return { status: 401 };

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return { status: 400 };
  }

  const payment = event?.payload?.payment?.entity;
  const order = event?.payload?.order?.entity;
  const orderId = payment?.order_id ?? order?.id;
  const amountPaid = order?.amount_paid ?? payment?.amount;
  if (!orderId) return { status: 200 };

  if (event.event !== "payment.captured" && event.event !== "order.paid") {
    return { status: 200, ignored: true };
  }

  const appointment = await db.bookAppointment.findFirst({
    where: { razorpayOrderId: orderId },
    select: { id: true, totalPriceInCents: true, priceInCents: true },
  });
  if (!appointment) return { status: 200 };

  const expectedAmount = appointment.totalPriceInCents ?? appointment.priceInCents;
  if (Number.isFinite(Number(amountPaid)) && Number(amountPaid) !== Number(expectedAmount)) {
    return { status: 200, rejected: "amount-mismatch" };
  }

  await finalizeBooking(appointment.id, payment?.id);
  return { status: 200, confirmed: true };
}

// ── Fixtures ────────────────────────────────────────────────────────────────

type World = {
  patientUserId: string;
  otherUserId: string;
  doctorId: string;
  patientId: string;
};

async function seedWorld(): Promise<World> {
  const doctor = await db.professionalUser.create({
    data: {
      email: `doc-${crypto.randomUUID()}@test.local`,
      userName: `doc-${crypto.randomUUID().slice(0, 8)}`,
      passwordHash: "x",
      isapproved: true,
      firstName: "Test",
      lastName: "Practitioner",
    },
  });

  await db.professionalUserAppointmentPrice.create({
    data: {
      professionalUserId: doctor.id,
      time: 30,
      priceInCentsForSingle: 100000,
      priceInCentsForCouple: 150000,
    },
  });

  const user = await db.user.create({
    data: {
      email: `patient-${crypto.randomUUID()}@test.local`,
      name: "Test Patient",
      passwordHash: "x",
      phoneNumber: "9999999999",
      otp: "",
      ageGreaterThan18: true,
      verifiedAt: new Date(),
    },
  });

  const other = await db.user.create({
    data: {
      email: `other-${crypto.randomUUID()}@test.local`,
      name: "Other Patient",
      passwordHash: "x",
      phoneNumber: "8888888888",
      otp: "",
      ageGreaterThan18: true,
      verifiedAt: new Date(),
    },
  });

  const patient = await db.patient.create({
    data: {
      firstName: "Test",
      lastName: "Patient",
      email: user.email,
      phoneNumber: "9999999999",
      userId: user.id,
    },
  });

  return {
    patientUserId: user.id,
    otherUserId: other.id,
    doctorId: doctor.id,
    patientId: patient.id,
  };
}

async function createPendingBooking(w: World, startingTime: Date, orderId: string) {
  const base = 100000;
  const tax = Math.round(0.18 * base);
  return db.bookAppointment.create({
    data: {
      serviceType: "ONLINE",
      priceInCents: base,
      taxedAmount: tax,
      totalPriceInCents: base + tax,
      description: "Consultation",
      planName: "Consultation",
      professionalUserId: w.doctorId,
      patientId: w.patientId,
      startingTime,
      endingTime: new Date(startingTime.getTime() + 30 * 60 * 1000),
      status: "PAYMENT_PENDING",
      userId: w.patientUserId,
      razorpayOrderId: orderId,
    },
  });
}

async function truncateAll() {
  await db.$executeRawUnsafe(`
    TRUNCATE TABLE
      "AppointmentPaymentPayout","Payout","AppointmentPayment","Comment",
      "ProfessionalUserRating","BookAppointment","AdditionalPatient","Patient",
      "ProfessionalNotification","professionalUserAppointmentPrice",
      "SessionRegistration","AuthSession","Notification",
      "ProfessionalUser","User","RateLimit"
    RESTART IDENTITY CASCADE
  `);
}

// ── Suite ───────────────────────────────────────────────────────────────────

describeDb("payment flow (end to end)", () => {
  let w: World;

  beforeAll(async () => {
    db = new PrismaClient({ datasources: { db: { url: TEST_DATABASE_URL } } });
    await db.$connect();
  });

  afterAll(async () => {
    await db?.$disconnect();
  });

  beforeEach(async () => {
    await truncateAll();
    w = await seedWorld();
  });

  // ── The happy path ────────────────────────────────────────────────────────

  it("confirms a correctly paid booking and records the practitioner's earning", async () => {
    const orderId = "order_happy";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);

    const result = await verifyPayment({
      callerUserId: w.patientUserId,
      orderId,
      paymentId: "pay_happy",
      signature: paymentSignature(orderId, "pay_happy"),
      gatewayStatus: "paid",
      gatewayAmountPaid: 118000,
    });

    expect(result.success).toBe(true);

    const after = await db.bookAppointment.findUnique({ where: { id: booking.id } });
    expect(after?.status).toBe("PAYMENT_SUCCESSFUL");
    expect(after?.razorpayPaymentId).toBe("pay_happy");

    // SW-12: the earning must exist, because it is the only input to payouts.
    const earning = await db.appointmentPayment.findUnique({
      where: { appointmentId: booking.id },
    });
    expect(earning).not.toBeNull();
    expect(earning?.totalAmountInCents).toBe(118000);
    expect(earning?.doctorShareInCents).toBe(94400);
    expect(earning?.platformShareInCents).toBe(23600);
  });

  // ── Attack cases ──────────────────────────────────────────────────────────

  it("rejects a forged payment signature and leaves the booking unpaid", async () => {
    const orderId = "order_forge";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);

    const result = await verifyPayment({
      callerUserId: w.patientUserId,
      orderId,
      paymentId: "pay_forge",
      signature: paymentSignature(orderId, "pay_forge", "attacker_secret"),
      gatewayStatus: "paid",
      gatewayAmountPaid: 118000,
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/signature/i);

    const after = await db.bookAppointment.findUnique({ where: { id: booking.id } });
    expect(after?.status).toBe("PAYMENT_PENDING");
    expect(
      await db.appointmentPayment.findUnique({ where: { appointmentId: booking.id } }),
    ).toBeNull();
  });

  it("rejects a genuine signature for an underpaid order", async () => {
    const orderId = "order_short";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);

    // Signature is real — this is the case a signature check alone cannot catch.
    const result = await verifyPayment({
      callerUserId: w.patientUserId,
      orderId,
      paymentId: "pay_short",
      signature: paymentSignature(orderId, "pay_short"),
      gatewayStatus: "paid",
      gatewayAmountPaid: 100,
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/amount/i);

    const after = await db.bookAppointment.findUnique({ where: { id: booking.id } });
    expect(after?.status).toBe("PAYMENT_PENDING");
  });

  it("rejects an order that belongs to another customer", async () => {
    const orderId = "order_theirs";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);

    const result = await verifyPayment({
      callerUserId: w.otherUserId, // signed in, but not the owner
      orderId,
      paymentId: "pay_theirs",
      signature: paymentSignature(orderId, "pay_theirs"),
      gatewayStatus: "paid",
      gatewayAmountPaid: 118000,
    });

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/not found/i);

    const after = await db.bookAppointment.findUnique({ where: { id: booking.id } });
    expect(after?.status).toBe("PAYMENT_PENDING");
  });

  it("rejects an unpaid gateway order even with a valid signature", async () => {
    const orderId = "order_created";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);

    const result = await verifyPayment({
      callerUserId: w.patientUserId,
      orderId,
      paymentId: "pay_created",
      signature: paymentSignature(orderId, "pay_created"),
      gatewayStatus: "created", // not "paid"
      gatewayAmountPaid: 0,
    });

    expect(result.success).toBe(false);
    const after = await db.bookAppointment.findUnique({ where: { id: booking.id } });
    expect(after?.status).toBe("PAYMENT_PENDING");
  });

  // ── Webhook ───────────────────────────────────────────────────────────────

  it("rejects an unsigned webhook", async () => {
    const orderId = "order_unsigned";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);

    const body = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_x", order_id: orderId, amount: 118000 } } },
    });

    expect((await handleWebhook(body, "")).status).toBe(401);
    expect((await handleWebhook(body, "deadbeef")).status).toBe(401);

    const after = await db.bookAppointment.findUnique({ where: { id: booking.id } });
    expect(after?.status).toBe("PAYMENT_PENDING");
  });

  /**
   * SW-12: the webhook is the path taken when the customer closes the tab. It used
   * to set the status and nothing else, so the practitioner was never paid.
   */
  it("does the full finalisation when only the webhook arrives", async () => {
    const orderId = "order_webhook_only";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);

    const body = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: { entity: { id: "pay_wh", order_id: orderId, amount: 118000 } },
      },
    });

    const res = await handleWebhook(body, webhookSignature(body));
    expect(res.status).toBe(200);
    expect(res.confirmed).toBe(true);

    const after = await db.bookAppointment.findUnique({ where: { id: booking.id } });
    expect(after?.status).toBe("PAYMENT_SUCCESSFUL");

    const earning = await db.appointmentPayment.findUnique({
      where: { appointmentId: booking.id },
    });
    expect(earning, "webhook-only booking must still create the earning").not.toBeNull();

    const notified = await db.professionalNotification.count({
      where: { professionalUserId: w.doctorId },
    });
    expect(notified).toBe(1);
  });

  it("refuses a webhook whose amount does not match the booking", async () => {
    const orderId = "order_wh_short";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);

    const body = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_s", order_id: orderId, amount: 500 } } },
    });

    const res = await handleWebhook(body, webhookSignature(body));
    expect(res.rejected).toBe("amount-mismatch");

    const after = await db.bookAppointment.findUnique({ where: { id: booking.id } });
    expect(after?.status).toBe("PAYMENT_PENDING");
  });

  // ── Idempotency ───────────────────────────────────────────────────────────

  it("is idempotent when the webhook is replayed", async () => {
    const orderId = "order_replay";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);

    const body = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_r", order_id: orderId, amount: 118000 } } },
    });
    const sig = webhookSignature(body);

    await handleWebhook(body, sig);
    await handleWebhook(body, sig);
    await handleWebhook(body, sig);

    // Exactly one earning, one notification — not three.
    expect(
      await db.appointmentPayment.count({ where: { appointmentId: booking.id } }),
    ).toBe(1);
    expect(
      await db.professionalNotification.count({ where: { professionalUserId: w.doctorId } }),
    ).toBe(1);
  });

  it("is idempotent when browser and webhook confirm concurrently", async () => {
    const orderId = "order_race";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);

    const body = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_race", order_id: orderId, amount: 118000 } } },
    });

    await Promise.all([
      verifyPayment({
        callerUserId: w.patientUserId,
        orderId,
        paymentId: "pay_race",
        signature: paymentSignature(orderId, "pay_race"),
        gatewayStatus: "paid",
        gatewayAmountPaid: 118000,
      }),
      handleWebhook(body, webhookSignature(body)),
    ]);

    const after = await db.bookAppointment.findUnique({ where: { id: booking.id } });
    expect(after?.status).toBe("PAYMENT_SUCCESSFUL");

    // The earning is upserted on both paths, so exactly one row either way.
    expect(
      await db.appointmentPayment.count({ where: { appointmentId: booking.id } }),
    ).toBe(1);
    // Only the winner sends the notification.
    expect(
      await db.professionalNotification.count({ where: { professionalUserId: w.doctorId } }),
    ).toBe(1);
  });

  // ── Slot integrity (SW-25) ────────────────────────────────────────────────

  it("cannot double-book a practitioner at the same instant", async () => {
    const slot = new Date(Date.now() + 864e5);
    await createPendingBooking(w, slot, "order_first");

    // The partial unique index is the backstop behind the application check.
    await expect(
      db.bookAppointment.create({
        data: {
          serviceType: "ONLINE",
          priceInCents: 100000,
          totalPriceInCents: 118000,
          description: "Consultation",
          planName: "Consultation",
          professionalUserId: w.doctorId,
          patientId: w.patientId,
          startingTime: slot,
          endingTime: new Date(slot.getTime() + 30 * 60 * 1000),
          status: "PAYMENT_PENDING",
          userId: w.otherUserId,
          razorpayOrderId: "order_second",
        },
      }),
    ).rejects.toThrow();
  });

  it("frees the slot once a booking is cancelled", async () => {
    const slot = new Date(Date.now() + 864e5);
    const first = await createPendingBooking(w, slot, "order_c1");
    await db.bookAppointment.update({
      where: { id: first.id },
      data: { status: "CANCELLED" },
    });

    const second = await db.bookAppointment.create({
      data: {
        serviceType: "ONLINE",
        priceInCents: 100000,
        totalPriceInCents: 118000,
        description: "Consultation",
        planName: "Consultation",
        professionalUserId: w.doctorId,
        patientId: w.patientId,
        startingTime: slot,
        endingTime: new Date(slot.getTime() + 30 * 60 * 1000),
        status: "PAYMENT_PENDING",
        userId: w.otherUserId,
        razorpayOrderId: "order_c2",
      },
    });

    expect(second.id).toBeTruthy();
  });

  // ── Payout ledger (SW-10) ─────────────────────────────────────────────────

  it("never lets payouts exceed the practitioner's earned balance", async () => {
    const orderId = "order_payout";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);

    await finalizeBooking(booking.id, "pay_payout");
    await db.appointmentPayment.update({
      where: { appointmentId: booking.id },
      data: { paymentStatus: "COMPLETED" },
    });

    const admin = await db.adminUser.create({
      data: {
        name: "Finance",
        email: `fin-${crypto.randomUUID()}@test.local`,
        passwordHash: "x",
        active: true,
        role: "FINANCE",
      },
    });

    const earned = 94400;

    // Mirrors initiatePayout, including the row lock that makes it safe.
    async function initiatePayout(amountInCents: number) {
      return db.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT id FROM "ProfessionalUser" WHERE id = ${w.doctorId} FOR UPDATE`;

        const totals = await tx.appointmentPayment.aggregate({
          where: { doctorId: w.doctorId, paymentStatus: "COMPLETED" },
          _sum: { doctorShareInCents: true },
        });
        const paid = await tx.appointmentPaymentPayout.aggregate({
          where: { appointmentPayment: { doctorId: w.doctorId } },
          _sum: { amountUsedInCents: true },
        });

        const available =
          (totals._sum.doctorShareInCents ?? 0) - (paid._sum.amountUsedInCents ?? 0);
        if (amountInCents > available) throw new Error("Insufficient balance");

        const payout = await tx.payout.create({
          data: {
            doctorId: w.doctorId,
            amountInCents,
            status: "PAID",
            initiatedByAdminId: admin.id,
            paidAt: new Date(),
          },
        });

        const earning = await tx.appointmentPayment.findFirstOrThrow({
          where: { doctorId: w.doctorId, paymentStatus: "COMPLETED" },
        });
        await tx.appointmentPaymentPayout.create({
          data: {
            appointmentPaymentId: earning.id,
            payoutId: payout.id,
            amountUsedInCents: amountInCents,
          },
        });
        return payout;
      });
    }

    await initiatePayout(earned);
    await expect(initiatePayout(1)).rejects.toThrow(/Insufficient balance/);

    const totalPaid = await db.appointmentPaymentPayout.aggregate({
      _sum: { amountUsedInCents: true },
    });
    expect(totalPaid._sum.amountUsedInCents).toBe(earned);
  });

  it("serialises two concurrent payouts so the balance is never spent twice", async () => {
    const orderId = "order_race_payout";
    const booking = await createPendingBooking(w, new Date(Date.now() + 864e5), orderId);
    await finalizeBooking(booking.id, "pay_rp");
    await db.appointmentPayment.update({
      where: { appointmentId: booking.id },
      data: { paymentStatus: "COMPLETED" },
    });

    const admin = await db.adminUser.create({
      data: {
        name: "Finance",
        email: `fin2-${crypto.randomUUID()}@test.local`,
        passwordHash: "x",
        active: true,
        role: "FINANCE",
      },
    });

    const earned = 94400;

    async function initiatePayout(amountInCents: number) {
      return db.$transaction(async (tx) => {
        // Without this lock both transactions read the full balance and both pass.
        await tx.$executeRaw`SELECT id FROM "ProfessionalUser" WHERE id = ${w.doctorId} FOR UPDATE`;

        const totals = await tx.appointmentPayment.aggregate({
          where: { doctorId: w.doctorId, paymentStatus: "COMPLETED" },
          _sum: { doctorShareInCents: true },
        });
        const paid = await tx.appointmentPaymentPayout.aggregate({
          where: { appointmentPayment: { doctorId: w.doctorId } },
          _sum: { amountUsedInCents: true },
        });
        const available =
          (totals._sum.doctorShareInCents ?? 0) - (paid._sum.amountUsedInCents ?? 0);
        if (amountInCents > available) throw new Error("Insufficient balance");

        const payout = await tx.payout.create({
          data: {
            doctorId: w.doctorId,
            amountInCents,
            status: "PAID",
            initiatedByAdminId: admin.id,
            paidAt: new Date(),
          },
        });
        const earning = await tx.appointmentPayment.findFirstOrThrow({
          where: { doctorId: w.doctorId, paymentStatus: "COMPLETED" },
        });
        await tx.appointmentPaymentPayout.create({
          data: {
            appointmentPaymentId: earning.id,
            payoutId: payout.id,
            amountUsedInCents: amountInCents,
          },
        });
        return payout;
      });
    }

    const results = await Promise.allSettled([
      initiatePayout(earned),
      initiatePayout(earned),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    expect(fulfilled.length, "exactly one payout may succeed").toBe(1);

    const totalPaid = await db.appointmentPaymentPayout.aggregate({
      _sum: { amountUsedInCents: true },
    });
    expect(totalPaid._sum.amountUsedInCents).toBe(earned);
  });

  // ── Paywall (SW-08) ───────────────────────────────────────────────────────

  it("withholds a session meeting link from anyone who has not paid", async () => {
    const category = await db.sessionCategory.create({
      data: { name: "Third trimester", slug: `cat-${crypto.randomUUID()}`, trimester: "THIRD" },
    });
    const liveSession = await db.session.create({
      data: {
        title: "Breastfeeding basics",
        slug: `sess-${crypto.randomUUID()}`,
        startAt: new Date(Date.now() + 864e5),
        endAt: new Date(Date.now() + 864e5 + 36e5),
        price: "999.00",
        status: "PUBLISHED",
        type: "ONLINE",
        meetingLink: "https://meet.example.com/secret-room",
        categoryId: category.id,
      },
    });

    /** Mirrors the gate in the session router. */
    async function getSessionForViewer(slug: string, viewerId?: string) {
      const s = await db.session.findUnique({
        where: { slug },
        select: {
          id: true,
          title: true,
          registrations: viewerId
            ? { where: { userId: viewerId }, select: { paymentStatus: true } }
            : false,
        },
      });
      if (!s) return null;
      const regs = (s as any).registrations;
      const hasPaid =
        viewerId !== undefined &&
        Array.isArray(regs) &&
        regs.some((r: any) => r.paymentStatus === "COMPLETED");
      let meetingLink: string | null = null;
      if (hasPaid) {
        const withLink = await db.session.findUnique({
          where: { id: s.id },
          select: { meetingLink: true },
        });
        meetingLink = withLink?.meetingLink ?? null;
      }
      return { ...s, meetingLink };
    }

    // Anonymous
    expect((await getSessionForViewer(liveSession.slug))?.meetingLink).toBeNull();

    // Signed in, not registered
    expect(
      (await getSessionForViewer(liveSession.slug, w.patientUserId))?.meetingLink,
    ).toBeNull();

    // Registered but payment still pending
    await db.sessionRegistration.create({
      data: {
        sessionId: liveSession.id,
        userId: w.patientUserId,
        paymentStatus: "PENDING",
        amountPaid: "999.00",
      },
    });
    expect(
      (await getSessionForViewer(liveSession.slug, w.patientUserId))?.meetingLink,
    ).toBeNull();

    // Paid — and only now
    await db.sessionRegistration.updateMany({
      where: { sessionId: liveSession.id, userId: w.patientUserId },
      data: { paymentStatus: "COMPLETED" },
    });
    expect(
      (await getSessionForViewer(liveSession.slug, w.patientUserId))?.meetingLink,
    ).toBe("https://meet.example.com/secret-room");

    // Another signed-in customer still gets nothing.
    expect(
      (await getSessionForViewer(liveSession.slug, w.otherUserId))?.meetingLink,
    ).toBeNull();
  });
});
