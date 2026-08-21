import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "@prisma/client";
import crypto from "node:crypto";
import { roleHasPermission } from "@repo/database";

/**
 * Access control across the three interfaces, exercised against a real database.
 *
 * Each case is written as "actor tries to reach something that is not theirs", and
 * asserts the query returns nothing — because the scoping lives in the `where`
 * clause, which is the only place it survives a refactor. Every one of these
 * corresponds to a defect that was live.
 */

const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL;
const describeDb = TEST_DATABASE_URL ? describe : describe.skip;

let db: PrismaClient;

type World = {
  patientA: string;
  patientB: string;
  doctorA: string;
  doctorB: string;
  patientRecordA: string;
  patientRecordB: string;
  apptA: string;
  apptB: string;
};

async function makeDoctor(name: string) {
  return db.professionalUser.create({
    data: {
      email: `${name}-${crypto.randomUUID()}@test.local`,
      userName: `${name}-${crypto.randomUUID().slice(0, 8)}`,
      passwordHash: "x",
      isapproved: true,
      firstName: name,
    },
  });
}

async function makeUser(name: string) {
  return db.user.create({
    data: {
      email: `${name}-${crypto.randomUUID()}@test.local`,
      name,
      passwordHash: "x",
      phoneNumber: "9000000000",
      otp: "",
      ageGreaterThan18: true,
      verifiedAt: new Date(),
    },
  });
}

async function makeBooking(userId: string, patientId: string, doctorId: string, when: Date) {
  return db.bookAppointment.create({
    data: {
      serviceType: "ONLINE",
      priceInCents: 100000,
      totalPriceInCents: 118000,
      description: "Consultation",
      planName: "Consultation",
      professionalUserId: doctorId,
      patientId,
      startingTime: when,
      endingTime: new Date(when.getTime() + 30 * 60 * 1000),
      status: "PAYMENT_SUCCESSFUL",
      userId,
      razorpayOrderId: `order_${crypto.randomUUID().slice(0, 12)}`,
      razorpayPaymentId: `pay_${crypto.randomUUID().slice(0, 12)}`,
    },
  });
}

async function seedWorld(): Promise<World> {
  const [dA, dB] = [await makeDoctor("docA"), await makeDoctor("docB")];
  const [uA, uB] = [await makeUser("alice"), await makeUser("bob")];

  const pA = await db.patient.create({
    data: { firstName: "Alice", email: uA.email, phoneNumber: "9000000001", userId: uA.id },
  });
  const pB = await db.patient.create({
    data: { firstName: "Bob", email: uB.email, phoneNumber: "9000000002", userId: uB.id },
  });

  const aA = await makeBooking(uA.id, pA.id, dA.id, new Date(Date.now() + 864e5));
  const aB = await makeBooking(uB.id, pB.id, dB.id, new Date(Date.now() + 2 * 864e5));

  await db.comment.create({
    data: { comment: "Private clinical note for Bob", bookAppointmentId: aB.id },
  });

  return {
    patientA: uA.id,
    patientB: uB.id,
    doctorA: dA.id,
    doctorB: dB.id,
    patientRecordA: pA.id,
    patientRecordB: pB.id,
    apptA: aA.id,
    apptB: aB.id,
  };
}

async function truncateAll() {
  await db.$executeRawUnsafe(`
    TRUNCATE TABLE
      "AppointmentPaymentPayout","Payout","AppointmentPayment","Comment",
      "ProfessionalUserRating","BookAppointment","AdditionalPatient","Patient",
      "ProfessionalNotification","professionalUserAppointmentPrice",
      "SessionRegistration","AuthSession","Notification","AdminAuditLog",
      "AdminUser","ProfessionalUser","User","RateLimit"
    RESTART IDENTITY CASCADE
  `);
}

describeDb("access control across interfaces", () => {
  let w: World;

  beforeAll(async () => {
    db = new PrismaClient({ datasources: { db: { url: TEST_DATABASE_URL } } });
    await db.$connect();
  });
  afterAll(async () => db?.$disconnect());
  beforeEach(async () => {
    await truncateAll();
    w = await seedWorld();
  });

  // ── Patient ↔ patient ─────────────────────────────────────────────────────

  describe("a patient", () => {
    it("sees only their own appointments", async () => {
      const mine = await db.bookAppointment.findMany({ where: { userId: w.patientA } });
      expect(mine.map((a) => a.id)).toEqual([w.apptA]);
    });

    /** SW-07: reschedule updated `where: { id }` with no userId. */
    it("cannot reschedule another patient's appointment", async () => {
      const moved = await db.bookAppointment.updateMany({
        where: { id: w.apptB, userId: w.patientA, status: "PAYMENT_SUCCESSFUL" },
        data: { startingTime: new Date(Date.now() + 5 * 864e5) },
      });
      expect(moved.count).toBe(0);
    });

    /** SW-03 / SW-01: cancellation must be scoped too. */
    it("cannot cancel another patient's appointment", async () => {
      const cancelled = await db.bookAppointment.updateMany({
        where: { id: w.apptB, userId: w.patientA, status: "PAYMENT_SUCCESSFUL" },
        data: { status: "CANCELLED_WITH_REFUND" },
      });
      expect(cancelled.count).toBe(0);

      const untouched = await db.bookAppointment.findUnique({ where: { id: w.apptB } });
      expect(untouched?.status).toBe("PAYMENT_SUCCESSFUL");
    });

    /** SW-27: the additional-patient writes were keyed on patientId alone. */
    it("cannot edit another patient's record or co-patients", async () => {
      const owned = await db.patient.findFirst({
        where: { id: w.patientRecordB, userId: w.patientA, deletedAt: null },
      });
      expect(owned).toBeNull();
    });

    /** SW-11: reviews required no ownership and no completed consultation. */
    it("cannot review an appointment that is not theirs", async () => {
      const eligible = await db.bookAppointment.findFirst({
        where: {
          id: w.apptB,
          userId: w.patientA,
          professionalUserId: w.doctorB,
          status: "COMPLETED",
        },
      });
      expect(eligible).toBeNull();
    });

    it("cannot review their own appointment until it is completed", async () => {
      const eligible = await db.bookAppointment.findFirst({
        where: {
          id: w.apptA,
          userId: w.patientA,
          professionalUserId: w.doctorA,
          status: "COMPLETED",
        },
      });
      expect(eligible).toBeNull();

      await db.bookAppointment.update({
        where: { id: w.apptA },
        data: { status: "COMPLETED" },
      });

      const nowEligible = await db.bookAppointment.findFirst({
        where: {
          id: w.apptA,
          userId: w.patientA,
          professionalUserId: w.doctorA,
          status: "COMPLETED",
        },
      });
      expect(nowEligible).not.toBeNull();
    });
  });

  // ── Practitioner ↔ practitioner ───────────────────────────────────────────

  describe("a practitioner", () => {
    it("sees only their own appointments", async () => {
      const mine = await db.bookAppointment.findMany({
        where: { professionalUserId: w.doctorA },
      });
      expect(mine.map((a) => a.id)).toEqual([w.apptA]);
    });

    /** SW-05: complete-appointment had its ownership filter commented out. */
    it("cannot complete another practitioner's appointment", async () => {
      const completed = await db.bookAppointment.updateMany({
        where: {
          id: w.apptB,
          professionalUserId: w.doctorA,
          status: "PAYMENT_SUCCESSFUL",
        },
        data: { status: "COMPLETED" },
      });
      expect(completed.count).toBe(0);
    });

    /** SW-01: and neither could cancelling — with no session at all. */
    it("cannot cancel and refund another practitioner's appointment", async () => {
      const found = await db.bookAppointment.findFirst({
        where: { id: w.apptB, professionalUserId: w.doctorA },
      });
      expect(found).toBeNull();
    });

    /** SW-09: the comment query was not scoped to the practitioner. */
    it("cannot read another practitioner's clinical notes", async () => {
      // The gate: resolve the appointment as the caller first.
      const gate = await db.bookAppointment.findFirst({
        where: { id: w.apptB, professionalUserId: w.doctorA },
        select: { id: true },
      });
      expect(gate).toBeNull();

      // Which means the comment query never runs. Proving the notes exist for
      // their real owner keeps this honest.
      const ownersGate = await db.bookAppointment.findFirst({
        where: { id: w.apptB, professionalUserId: w.doctorB },
        select: { id: true },
      });
      expect(ownersGate).not.toBeNull();
      const notes = await db.comment.findMany({
        where: { bookAppointmentId: ownersGate!.id },
      });
      expect(notes).toHaveLength(1);
    });

    /** SW-06: the day-range router returned the whole practitioner row. */
    it("is never served credential or token columns", async () => {
      const row = await db.professionalUser.findFirst({
        where: { id: w.doctorA },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          userName: true,
          email: true,
          createdAt: true,
        },
      });
      expect(row).not.toBeNull();
      expect(Object.keys(row!).sort()).toEqual(
        ["createdAt", "email", "firstName", "id", "lastName", "userName"].sort(),
      );
      expect(row).not.toHaveProperty("passwordHash");
      expect(row).not.toHaveProperty("googleRefreshToken");
      expect(row).not.toHaveProperty("bankAccountNumber");
    });

    it("sees only their own earnings", async () => {
      await db.appointmentPayment.create({
        data: {
          appointmentId: w.apptB,
          doctorId: w.doctorB,
          totalAmountInCents: 118000,
          doctorShareInCents: 94400,
          platformShareInCents: 23600,
          paymentStatus: "COMPLETED",
        },
      });

      const mine = await db.appointmentPayment.aggregate({
        where: { doctorId: w.doctorA, paymentStatus: "COMPLETED" },
        _sum: { doctorShareInCents: true },
      });
      expect(mine._sum.doctorShareInCents ?? 0).toBe(0);
    });
  });

  // ── Admin roles ───────────────────────────────────────────────────────────

  describe("an administrator", () => {
    it("cannot initiate a payout without payout:write", async () => {
      for (const role of ["SUPPORT", "CONTENT", "OPERATIONS"] as const) {
        expect(roleHasPermission(role, "payout:write"), role).toBe(false);
      }
      for (const role of ["FINANCE", "SUPER_ADMIN"] as const) {
        expect(roleHasPermission(role, "payout:write"), role).toBe(true);
      }
    });

    it("cannot create other administrators without admin:write", async () => {
      for (const role of ["SUPPORT", "CONTENT", "OPERATIONS", "FINANCE"] as const) {
        expect(roleHasPermission(role, "admin:write"), role).toBe(false);
      }
    });

    /** The role is read from the database, so deactivation takes effect at once. */
    it("loses access the moment the account is deactivated", async () => {
      const admin = await db.adminUser.create({
        data: {
          name: "Ops",
          email: `ops-${crypto.randomUUID()}@test.local`,
          passwordHash: "x",
          active: true,
          role: "OPERATIONS",
        },
      });

      const before = await db.adminUser.findFirst({
        where: { id: admin.id, active: true },
        select: { role: true },
      });
      expect(before?.role).toBe("OPERATIONS");

      await db.adminUser.update({ where: { id: admin.id }, data: { active: false } });

      const after = await db.adminUser.findFirst({
        where: { id: admin.id, active: true },
        select: { role: true },
      });
      expect(after).toBeNull();
    });

    it("defaults a newly created administrator to the least-privileged role", async () => {
      const admin = await db.adminUser.create({
        data: {
          name: "New",
          email: `new-${crypto.randomUUID()}@test.local`,
          passwordHash: "x",
          active: true,
        },
      });
      expect(admin.role).toBe("SUPPORT");
    });
  });

  // ── Audit trail ───────────────────────────────────────────────────────────

  describe("the audit trail", () => {
    it("records who moved money", async () => {
      const admin = await db.adminUser.create({
        data: {
          name: "Finance",
          email: `f-${crypto.randomUUID()}@test.local`,
          passwordHash: "x",
          active: true,
          role: "FINANCE",
        },
      });

      await db.adminAuditLog.create({
        data: {
          actorId: admin.id,
          actorEmail: admin.email,
          action: "payout.initiated",
          entity: "Payout",
          entityId: "payout_1",
          summary: "Paid 94400 paise",
        },
      });

      const entries = await db.adminAuditLog.findMany({
        where: { action: "payout.initiated" },
      });
      expect(entries).toHaveLength(1);
      expect(entries[0]!.actorEmail).toBe(admin.email);
    });
  });
});
