import { hash } from "bcryptjs";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

/**
 * Creates the first administrator.
 *
 * Two things were wrong with the previous version.
 *
 * **A hardcoded credential.** It created `admin@admin.com` with the password
 * `admin@123`, active. That pair is in the repository, so every deployment seeded
 * from it shipped with a publicly known way in.
 *
 * **No super admin.** It set no `role`, so the schema default `SUPPORT` applied —
 * read-only. A freshly seeded deployment therefore had nobody who could manage
 * administrators or initiate payouts, and no route to promote anyone except direct
 * database access.
 *
 * Now: the credential comes from the environment, and the account is created as
 * SUPER_ADMIN because bootstrapping is the one case where that is the point. If no
 * password is supplied a strong one is generated and printed **once** — it is not
 * stored anywhere else, so it has to be captured at that moment.
 *
 *   SEED_ADMIN_EMAIL=ops@yourdomain.com \
 *   SEED_ADMIN_PASSWORD='...' \
 *   pnpm --filter @repo/database db:seed:admin
 *
 * Safe to re-run: an existing account is left alone rather than overwritten.
 */

const BCRYPT_COST = 12;
const MIN_PASSWORD_LENGTH = 12;

function generatePassword(): string {
  // 24 bytes of entropy, URL-safe. Well beyond anything worth guessing.
  return crypto.randomBytes(24).toString("base64url");
}

const main = async () => {
  const db = new PrismaClient();

  try {
    const email = (process.env.SEED_ADMIN_EMAIL ?? "").trim().toLowerCase();

    if (!email) {
      throw new Error(
        "SEED_ADMIN_EMAIL is required. Refusing to seed a default administrator account.",
      );
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      throw new Error(`SEED_ADMIN_EMAIL is not a valid address: ${email}`);
    }

    const existing = await db.adminUser.findUnique({
      where: { email },
      select: { id: true, role: true },
    });

    if (existing) {
      console.log(
        `Admin ${email} already exists (role ${existing.role}); leaving it unchanged.`,
      );
      return;
    }

    const supplied = process.env.SEED_ADMIN_PASSWORD;
    const generated = supplied ? null : generatePassword();
    const password = supplied ?? generated!;

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(
        `SEED_ADMIN_PASSWORD must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
    }

    const passwordHash = await hash(password, BCRYPT_COST);

    await db.adminUser.create({
      data: {
        name: process.env.SEED_ADMIN_NAME?.trim() || "Administrator",
        email,
        passwordHash,
        active: true,
        // Bootstrapping is the one case where SUPER_ADMIN is correct: without it
        // nobody can promote anyone, and the panel is unusable. Every subsequent
        // admin is created through the UI, which defaults to SUPPORT.
        role: "SUPER_ADMIN",
      },
    });

    console.log(`Created SUPER_ADMIN ${email}.`);

    if (generated) {
      console.log("");
      console.log("  Generated password (shown once, not stored anywhere else):");
      console.log(`    ${generated}`);
      console.log("");
      console.log("  Sign in and change it now.");
    }
  } finally {
    await db.$disconnect();
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  // Non-zero, so a failed seed fails the deploy step that ran it instead of
  // looking like it succeeded.
  process.exit(1);
});
