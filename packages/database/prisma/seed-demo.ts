/**
 * Demo seed — a super admin, a practitioner, patients, and enough surrounding data
 * to exercise every screen in all three apps.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  SAFETY
 * ─────────────────────────────────────────────────────────────────────────────
 * This writes accounts with known passwords. Running it against a production
 * database would create a documented way in, so it refuses to run unless:
 *
 *   1. `SEED_DEMO=yes` is set — a deliberate act, not a stray `pnpm db:seed`; and
 *   2. the target does not look like a managed/hosted database, unless
 *      `SEED_DEMO_ALLOW_REMOTE=yes` is also set.
 *
 * It reads `DEMO_DATABASE_URL` if present, falling back to `DATABASE_URL`. Point it
 * at a scratch database.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *  USAGE
 * ─────────────────────────────────────────────────────────────────────────────
 *   SEED_DEMO=yes \
 *   DEMO_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/shewell_dev \
 *     pnpm --filter @repo/database db:seed:demo
 *
 * Passwords are generated per run unless you pass `DEMO_PASSWORD`, and every
 * credential is printed at the end. Re-running is safe: it upserts by email.
 */

import { hash } from "bcryptjs";
import crypto from "crypto";
import { PrismaClient, Prisma } from "@prisma/client";

const BCRYPT_COST = 12;

// ── Guards ──────────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DEMO_DATABASE_URL ?? process.env.DATABASE_URL;

function assertSafeToRun() {
  if (process.env.SEED_DEMO !== "yes") {
    throw new Error(
      "Refusing to run. This seed creates accounts with known passwords.\n" +
        "Set SEED_DEMO=yes if you are certain this is a development database.",
    );
  }

  if (!DATABASE_URL) {
    throw new Error("No DEMO_DATABASE_URL or DATABASE_URL is set.");
  }

  const looksHosted =
    /supabase|neon\.tech|amazonaws|azure|render\.com|railway|planetscale|\.cloud/i.test(
      DATABASE_URL,
    );
  const looksLocal = /@(localhost|127\.0\.0\.1|host\.docker\.internal)[:/]/i.test(
    DATABASE_URL,
  );

  if ((looksHosted || !looksLocal) && process.env.SEED_DEMO_ALLOW_REMOTE !== "yes") {
    const host = DATABASE_URL.replace(/:\/\/[^@]*@/, "://***@");
    throw new Error(
      `Refusing to seed demo data into what looks like a hosted database:\n  ${host}\n\n` +
        "If this really is a disposable environment, set SEED_DEMO_ALLOW_REMOTE=yes.",
    );
  }
}

// ── Credentials ─────────────────────────────────────────────────────────────

/** Readable but not guessable: two words plus entropy. */
function makePassword(label: string): string {
  return `${label}-${crypto.randomBytes(9).toString("base64url")}`;
}

const CREDENTIALS = {
  admin: {
    email: process.env.DEMO_ADMIN_EMAIL ?? "superadmin@shewell.test",
    password: process.env.DEMO_PASSWORD ?? makePassword("Admin"),
  },
  doctor: {
    email: process.env.DEMO_DOCTOR_EMAIL ?? "dr.meera@shewell.test",
    password: process.env.DEMO_PASSWORD ?? makePassword("Doctor"),
  },
  patient: {
    email: process.env.DEMO_PATIENT_EMAIL ?? "asha.patient@shewell.test",
    password: process.env.DEMO_PASSWORD ?? makePassword("Patient"),
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

const db = new PrismaClient({ datasources: { db: { url: DATABASE_URL } } });

/** Days from now, at a fixed local hour, so slots are stable across runs. */
function at(daysFromNow: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d;
}

/** A `@db.Time()` value — Prisma stores only the time part. */
function timeOfDay(hour: number, minute = 0): Date {
  return new Date(Date.UTC(1970, 0, 1, hour, minute, 0, 0));
}

async function main() {
  assertSafeToRun();

  console.log("Seeding demo data…\n");

  // ── Location ──────────────────────────────────────────────────────────────
  const country = await db.country.upsert({
    where: { id: "demo-country-in" },
    update: {},
    create: {
      id: "demo-country-in",
      name: "India",
      iso3: "IND",
      iso2: "IN",
      phoneCode: "91",
      currency: "INR",
      currencyName: "Indian rupee",
      currencySymbol: "₹",
      region: "Asia",
      nationality: "Indian",
      active: true,
    },
  });

  const state = await db.state.upsert({
    where: { id: "demo-state-tn" },
    update: {},
    create: {
      id: "demo-state-tn",
      name: "Tamil Nadu",
      stateCode: "TN",
      countryId: country.id,
    },
  });

  const city = await db.city.upsert({
    where: { id: "demo-city-cbe" },
    update: {},
    create: {
      id: "demo-city-cbe",
      name: "Coimbatore",
      countryId: country.id,
      stateId: state.id,
      latitude: new Prisma.Decimal("11.0168"),
      longitude: new Prisma.Decimal("76.9558"),
    },
  });

  // ── Media ─────────────────────────────────────────────────────────────────
  const media = await db.media.upsert({
    where: { id: "demo-media-1" },
    update: {},
    create: {
      id: "demo-media-1",
      fileKey: "demo/placeholder.jpg",
      // A local path, served from each app's own `public/`. An external
      // placeholder host would have to be added to `images.remotePatterns` in all
      // three next configs — widening an image allowlist to accommodate demo data
      // is the wrong trade. Components dereference `fileUrl` with `!`, so it also
      // cannot be null.
      fileUrl: "/product-fallback.png",
      comments: "Demo placeholder",
      mimeType: "image/jpeg",
    },
  });

  // ── Admin (SUPER_ADMIN) ───────────────────────────────────────────────────
  const adminHash = await hash(CREDENTIALS.admin.password, BCRYPT_COST);
  const admin = await db.adminUser.upsert({
    where: { email: CREDENTIALS.admin.email },
    update: { passwordHash: adminHash, active: true, role: "SUPER_ADMIN" },
    create: {
      name: "Demo Super Admin",
      email: CREDENTIALS.admin.email,
      passwordHash: adminHash,
      active: true,
      role: "SUPER_ADMIN",
    },
  });

  // One admin per tier, so the permission matrix can be exercised end to end.
  const otherAdmins: Record<string, string> = {};
  for (const role of ["OPERATIONS", "FINANCE", "CONTENT", "SUPPORT"] as const) {
    const email = `${role.toLowerCase()}@shewell.test`;
    const pwd = process.env.DEMO_PASSWORD ?? makePassword(role);
    await db.adminUser.upsert({
      where: { email },
      update: { passwordHash: await hash(pwd, BCRYPT_COST), active: true, role },
      create: {
        name: `Demo ${role}`,
        email,
        passwordHash: await hash(pwd, BCRYPT_COST),
        active: true,
        role,
      },
    });
    otherAdmins[email] = pwd;
  }

  // ── Taxonomy ──────────────────────────────────────────────────────────────
  const parentCategory = await db.professionalSpecializationParentCategory.upsert({
    where: { id: "demo-spec-parent" },
    update: {},
    create: {
      id: "demo-spec-parent",
      name: "Maternal health",
      active: true,
      mediaId: media.id,
    },
  });

  const specialisations = await Promise.all(
    [
      ["demo-spec-lactation", "Lactation consultant"],
      ["demo-spec-obgyn", "Obstetrics & gynaecology"],
      ["demo-spec-mental", "Perinatal mental health"],
    ].map(([id, name]) =>
      db.professionalSpecializations.upsert({
        where: { id: id! },
        update: {},
        create: {
          id: id!,
          specialization: name!,
          active: true,
          professionalSpecializationParentCategoryId: parentCategory.id,
        },
      }),
    ),
  );

  const languages = await Promise.all(
    [
      ["demo-lang-en", "English"],
      ["demo-lang-ta", "Tamil"],
      ["demo-lang-hi", "Hindi"],
    ].map(([id, name]) =>
      db.professionalLanguages.upsert({
        where: { id: id! },
        update: {},
        create: { id: id!, language: name!, active: true },
      }),
    ),
  );

  // ── Practitioner ──────────────────────────────────────────────────────────
  const doctorHash = await hash(CREDENTIALS.doctor.password, BCRYPT_COST);
  const doctor = await db.professionalUser.upsert({
    where: { email: CREDENTIALS.doctor.email },
    update: { passwordHash: doctorHash, isapproved: true, deletedAt: null },
    create: {
      email: CREDENTIALS.doctor.email,
      userName: "dr-meera",
      passwordHash: doctorHash,
      firstName: "Meera",
      lastName: "Raghavan",
      phoneNumber: "9876543210",
      dob: new Date("1985-04-12"),
      gender: "Female",
      // `isapproved` is the credential check for this product: an unapproved
      // practitioner is not bookable and does not appear in listings.
      isapproved: true,
      aboutYou:
        "Lactation consultant and perinatal educator with 12 years of practice.",
      aboutEducation: "MBBS, DGO — Madras Medical College. IBCLC certified.",
      sessionMode: "ONLINE",
      totalConsultations: 0,
      mediaId: media.id,
      displayQualificationId: specialisations[0]!.id,
      ProfessionalSpecializations: {
        connect: specialisations.slice(0, 2).map((s) => ({ id: s.id })),
      },
      languages: { connect: languages.map((l) => ({ id: l.id })) },
      // Deliberately fake and clearly non-transactable.
      bankAccountHolderName: "Meera Raghavan",
      bankAccountNumber: "000011112222",
      bankName: "Demo Bank",
      bankBranch: "Coimbatore Main",
      bankIfscCode: "DEMO0001234",
      bankUpiId: "meera@okdemo",
    },
  });

  await db.professionalAddress.upsert({
    where: { professionalUserId: doctor.id },
    update: {},
    create: {
      professionalUserId: doctor.id,
      countryId: country.id,
      stateId: state.id,
      city: "Coimbatore",
      completeAddress: "12 Race Course Road",
      pincode: "641018",
    },
  });

  await db.professionalIdentity.upsert({
    where: { professionalUserId: doctor.id },
    update: {},
    create: {
      professionalUserId: doctor.id,
      panNumber: "AAAAA0000A",
      aadhaarNumber: "000000000000",
      licenseNumber: "TN-DEMO-2014-0099",
      isVerified: true,
    },
  });

  await db.professionalQualifications.deleteMany({ where: { professionalUserId: doctor.id } });
  await db.professionalQualifications.create({
    data: {
      professionalUserId: doctor.id,
      degree: ["MBBS", "DGO"],
      stateId: state.id,
      city: "Coimbatore",
      cityId: city.id,
    },
  });

  await db.professionalDegree.deleteMany({ where: { professionalUserId: doctor.id } });
  await db.professionalDegree.createMany({
    data: [
      {
        professionalUserId: doctor.id,
        degree: "MBBS",
        collegeName: "Madras Medical College",
        completionDate: new Date("2008-06-30"),
      },
      {
        professionalUserId: doctor.id,
        degree: "DGO",
        collegeName: "Madras Medical College",
        completionDate: new Date("2011-06-30"),
      },
    ],
  });

  // Consultation rates. `resolveAppointmentPrice` refuses to price a booking whose
  // duration has no configured rate, so both durations the UI offers are set.
  await db.professionalUserAppointmentPrice.deleteMany({
    where: { professionalUserId: doctor.id },
  });
  await db.professionalUserAppointmentPrice.createMany({
    data: [
      {
        professionalUserId: doctor.id,
        time: 30,
        priceInCentsForSingle: 100000, // ₹1,000
        priceInCentsForCouple: 150000, // ₹1,500
      },
      {
        professionalUserId: doctor.id,
        time: 60,
        priceInCentsForSingle: 180000,
        priceInCentsForCouple: 250000,
      },
    ],
  });

  // Weekly availability, Monday to Friday.
  await db.availability.deleteMany({ where: { professionalUserId: doctor.id } });
  for (const day of ["MON", "TUE", "WED", "THU", "FRI"] as const) {
    await db.availability.create({
      data: {
        available: true,
        day,
        professionalUserId: doctor.id,
        availableTimings: {
          create: [
            { startingTime: timeOfDay(10, 0), endingTime: timeOfDay(13, 0) },
            { startingTime: timeOfDay(16, 0), endingTime: timeOfDay(19, 0) },
          ],
        },
      },
    });
  }

  // ── Patient ───────────────────────────────────────────────────────────────
  const patientHash = await hash(CREDENTIALS.patient.password, BCRYPT_COST);
  const user = await db.user.upsert({
    where: { email: CREDENTIALS.patient.email },
    update: { passwordHash: patientHash, verifiedAt: new Date(), deletedAt: null },
    create: {
      email: CREDENTIALS.patient.email,
      name: "Asha Kumar",
      passwordHash: patientHash,
      phoneNumber: "9123456780",
      // Empty, not a live code: a populated `otp` on a verified account is a
      // stale credential.
      otp: "",
      ageGreaterThan18: true,
      verifiedAt: new Date(),
    },
  });

  let patient = await db.patient.findFirst({
    where: { userId: user.id, deletedAt: null },
  });
  if (!patient) {
    patient = await db.patient.create({
      data: {
        firstName: "Asha",
        lastName: "Kumar",
        email: user.email,
        phoneNumber: "9123456780",
        message: "Second trimester, first pregnancy.",
        userId: user.id,
        additionalPatients: {
          create: [
            {
              firstName: "Ravi",
              lastName: "Kumar",
              email: "ravi.kumar@shewell.test",
              phoneNumber: "9123456781",
              message: "Partner, attending the couple session.",
            },
          ],
        },
      },
    });
  }

  // ── Appointments, one per lifecycle state ─────────────────────────────────
  await db.appointmentPayment.deleteMany({
    where: { appointment: { userId: user.id } },
  });
  await db.comment.deleteMany({ where: { bookAppointment: { userId: user.id } } });
  await db.professionalUserRating.deleteMany({
    where: { bookAppointment: { userId: user.id } },
  });
  await db.bookAppointment.deleteMany({ where: { userId: user.id } });

  const base = 100000;
  const tax = Math.round(base * 0.18);
  const total = base + tax;

  const upcoming = await db.bookAppointment.create({
    data: {
      serviceType: "ONLINE",
      priceInCents: base,
      taxedAmount: tax,
      totalPriceInCents: total,
      description: "Lactation consultation",
      planName: "Lactation consultation",
      professionalUserId: doctor.id,
      patientId: patient.id,
      userId: user.id,
      startingTime: at(3, 11),
      endingTime: at(3, 11, 30),
      status: "PAYMENT_SUCCESSFUL",
      razorpayOrderId: "order_demo_upcoming",
      razorpayPaymentId: "pay_demo_upcoming",
    },
  });

  const completed = await db.bookAppointment.create({
    data: {
      serviceType: "ONLINE",
      priceInCents: base,
      taxedAmount: tax,
      totalPriceInCents: total,
      description: "Antenatal check-in",
      planName: "Antenatal check-in",
      professionalUserId: doctor.id,
      patientId: patient.id,
      userId: user.id,
      startingTime: at(-7, 11),
      endingTime: at(-7, 11, 30),
      status: "COMPLETED",
      razorpayOrderId: "order_demo_completed",
      razorpayPaymentId: "pay_demo_completed",
    },
  });

  await db.bookAppointment.create({
    data: {
      serviceType: "ONLINE",
      priceInCents: base,
      taxedAmount: tax,
      totalPriceInCents: total,
      description: "Cancelled consultation",
      planName: "Cancelled consultation",
      professionalUserId: doctor.id,
      patientId: patient.id,
      userId: user.id,
      startingTime: at(-2, 15),
      endingTime: at(-2, 15, 30),
      status: "CANCELLED_WITH_REFUND",
      razorpayOrderId: "order_demo_cancelled",
      razorpayPaymentId: "pay_demo_cancelled",
      razorpayRefundId: "rfnd_demo_cancelled",
    },
  });

  // Earnings for both paid consultations. The completed one is COMPLETED, so it is
  // payable; the upcoming one stays PENDING until the consultation happens.
  const doctorShare = Math.floor(total * 0.8);
  await db.appointmentPayment.createMany({
    data: [
      {
        appointmentId: upcoming.id,
        doctorId: doctor.id,
        totalAmountInCents: total,
        doctorShareInCents: doctorShare,
        platformShareInCents: total - doctorShare,
        paymentStatus: "PENDING",
      },
      {
        appointmentId: completed.id,
        doctorId: doctor.id,
        totalAmountInCents: total,
        doctorShareInCents: doctorShare,
        platformShareInCents: total - doctorShare,
        paymentStatus: "COMPLETED",
      },
    ],
  });

  await db.comment.create({
    data: {
      bookAppointmentId: completed.id,
      comment: "Latch improving. Reviewed positioning; follow up in two weeks.",
    },
  });

  await db.professionalUserRating.create({
    data: {
      rating: 5,
      review: "Extremely reassuring and practical. Answered every question.",
      professionalUserId: doctor.id,
      bookAppointmentId: completed.id,
    },
  });

  const avg = await db.professionalUserRating.aggregate({
    where: { professionalUserId: doctor.id },
    _avg: { rating: true },
  });
  await db.professionalUser.update({
    where: { id: doctor.id },
    data: {
      avgRating: avg._avg.rating ?? null,
      totalConsultations: await db.bookAppointment.count({
        where: { professionalUserId: doctor.id, status: "COMPLETED" },
      }),
    },
  });

  await db.professionalNotification.create({
    data: {
      title: "New Appointment Booked",
      description: `You have a new ONLINE appointment with ${patient.firstName}.`,
      professionalUserId: doctor.id,
      time: new Date(),
    },
  });

  await db.notification.create({
    data: {
      title: "Appointment confirmed",
      description: "Your consultation with Dr Meera Raghavan is confirmed.",
      userId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // ── Group sessions ────────────────────────────────────────────────────────
  const sessionCategory = await db.sessionCategory.upsert({
    where: { slug: "third-trimester" },
    update: {},
    create: { name: "Third trimester", slug: "third-trimester", trimester: "THIRD" },
  });

  const liveSession = await db.session.upsert({
    where: { slug: "breastfeeding-basics" },
    update: {},
    create: {
      title: "Breastfeeding basics",
      slug: "breastfeeding-basics",
      startAt: at(10, 18),
      endAt: at(10, 19, 30),
      price: new Prisma.Decimal("999.00"),
      status: "PUBLISHED",
      type: "ONLINE",
      language: "English",
      overview:
        "A 90-minute live class covering latch, supply, expressing and the first six weeks.",
      // Released only to a viewer with a COMPLETED registration.
      meetingLink: "https://meet.example.com/demo-breastfeeding-basics",
      maxBookings: 40,
      categoryId: sessionCategory.id,
      thumbnailMediaId: media.id,
    },
  });

  // Banners for the booking flow.
  //
  // Without these, `session.banners` is an empty array and BookingSection's
  // `banners?.[0].media` threw — optional chaining guarded the array being
  // nullish but not the index being out of range. Seeding two means the
  // multi-step booking backdrop is actually exercised by the demo data instead
  // of silently taking the fallback.
  const existingBanners = await db.sessionBanner.count({
    where: { sessionId: liveSession.id },
  });
  if (existingBanners === 0) {
    await db.sessionBanner.createMany({
      data: [
        { sessionId: liveSession.id, mediaId: media.id },
        { sessionId: liveSession.id, mediaId: media.id },
      ],
    });
  }

  // A draft, to confirm it never appears in public listings.
  await db.session.upsert({
    where: { slug: "unpublished-draft-session" },
    update: {},
    create: {
      title: "Unpublished draft session",
      slug: "unpublished-draft-session",
      startAt: at(20, 18),
      endAt: at(20, 19),
      price: new Prisma.Decimal("499.00"),
      status: "DRAFT",
      type: "ONLINE",
      overview: "Should be invisible to the public listing and to /session?status=DRAFT.",
      categoryId: sessionCategory.id,
    },
  });

  await db.sessionRegistration.upsert({
    where: { sessionId_userId: { sessionId: liveSession.id, userId: user.id } },
    update: { paymentStatus: "COMPLETED" },
    create: {
      sessionId: liveSession.id,
      userId: user.id,
      paymentStatus: "COMPLETED",
      amountPaid: new Prisma.Decimal("999.00"),
      razorpayOrderId: "order_demo_session",
      razorpayPaymentId: "pay_demo_session",
    },
  });

  // ── Content ───────────────────────────────────────────────────────────────
  const blogCategory = await db.blogCategory.upsert({
    where: { slug: "newborn-care" },
    update: {},
    create: {
      name: "Newborn care",
      slug: "newborn-care",
      active: true,
      metaTitle: "Newborn care",
      metaDescription: "Guidance for the first weeks.",
      metaKeywords: ["newborn", "care"],
    },
  });

  await db.blog.upsert({
    where: { slug: "first-week-with-your-newborn" },
    update: {},
    create: {
      title: "The first week with your newborn",
      slug: "first-week-with-your-newborn",
      author: "Dr Meera Raghavan",
      mediaId: media.id,
      categoryId: blogCategory.id,
      shortDescription: "What to expect, and what is worth a call.",
      body: "<h2>The first week</h2><p>Feeding, sleep and when to seek help.</p>",
      active: true,
      popularBlog: true,
      seoKeywords: ["newborn", "first week"],
    },
  });

  await db.testimonials.upsert({
    where: { id: "demo-testimonial-1" },
    update: {},
    create: {
      id: "demo-testimonial-1",
      title: "Felt genuinely supported",
      name: "Priya S.",
      mediaId: media.id,
      active: true,
      avgRating: new Prisma.Decimal("5"),
    },
  });

  await db.homeBanner.upsert({
    where: { id: "demo-banner-client" },
    update: {},
    create: {
      id: "demo-banner-client",
      order: 1,
      mediaId: media.id,
      active: true,
      usedFor: "HomeBannerClient",
    },
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  const counts = {
    adminUsers: await db.adminUser.count(),
    practitioners: await db.professionalUser.count(),
    patients: await db.user.count(),
    appointments: await db.bookAppointment.count(),
    sessions: await db.session.count(),
    blogs: await db.blog.count(),
  };

  const line = "─".repeat(74);
  console.log(line);
  console.log("  DEMO CREDENTIALS — development only, never a real environment");
  console.log(line);
  console.log("");
  console.log("  ADMIN PANEL          (default http://localhost:3004)");
  console.log(`    super admin        ${CREDENTIALS.admin.email}`);
  console.log(`    password           ${CREDENTIALS.admin.password}`);
  console.log("");
  for (const [email, pwd] of Object.entries(otherAdmins)) {
    console.log(`    ${email.split("@")[0]!.padEnd(18)} ${email}  /  ${pwd}`);
  }
  console.log("");
  console.log("  PRACTITIONER PORTAL  (default http://localhost:3002)");
  console.log(`    email              ${CREDENTIALS.doctor.email}`);
  console.log(`    password           ${CREDENTIALS.doctor.password}`);
  console.log(`    username           dr-meera   (approved, bookable)`);
  console.log("");
  console.log("  PATIENT APP          (default http://localhost:3001)");
  console.log(`    email              ${CREDENTIALS.patient.email}`);
  console.log(`    password           ${CREDENTIALS.patient.password}`);
  console.log("");
  console.log(line);
  console.log("  Seeded:", JSON.stringify(counts));
  console.log(line);
  console.log("");
  console.log("  Note: OTP sign-in mails a code, so use password sign-in unless");
  console.log("  SENDGRID_API_KEY is configured.");
  console.log("");
}

main()
  .catch((error) => {
    console.error("\n" + (error instanceof Error ? error.message : String(error)) + "\n");
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
