-- Email verification for practitioner accounts.
--
-- Registration created the account and signed the practitioner in immediately, with
-- nobody having proved control of the address. That address receives appointment
-- notifications and the password-reset link, so a typo routed both to a stranger,
-- and nothing stopped someone registering under an address that was not theirs.
--
-- The columns mirror the ones already on "User" for patients: a nullable verified-at
-- timestamp, the pending code, and the brute-force counters.
ALTER TABLE "ProfessionalUser"
  ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "otp" TEXT,
  ADD COLUMN IF NOT EXISTS "otpCreatedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "otpAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "otpLockedUntil" TIMESTAMP(3);

-- Backfill, and this is the important half.
--
-- Sign-in refuses an account whose "emailVerifiedAt" is null. Without this every
-- practitioner who registered before today — including approved, actively practising
-- ones with booked appointments — would be locked out of the portal the moment this
-- deploys, with no way back in but a code sent to an address the new flow has never
-- asked them to confirm.
--
-- They are treated as verified on the strength of having already been through
-- registration and admin approval. Only accounts created from now on have to prove
-- the address.
UPDATE "ProfessionalUser"
  SET "emailVerifiedAt" = COALESCE("emailVerifiedAt", "createdAt")
  WHERE "emailVerifiedAt" IS NULL;

-- Sign-in filters on this column on every attempt.
CREATE INDEX IF NOT EXISTS "ProfessionalUser_emailVerifiedAt_idx"
  ON "ProfessionalUser" ("emailVerifiedAt");
