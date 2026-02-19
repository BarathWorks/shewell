/*
  Warnings:

  - The values [REQUESTED,APPROVED,REJECTED] on the enum `PayoutStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `payoutRequestId` on the `AppointmentPaymentPayout` table. All the data in the column will be lost.
  - You are about to drop the `PayoutRequest` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[appointmentPaymentId,payoutId]` on the table `AppointmentPaymentPayout` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payoutId` to the `AppointmentPaymentPayout` table without a default value. This is not possible if the table is not empty.

*/

BEGIN;

-- Drop foreign keys referencing PayoutRequest
ALTER TABLE "AppointmentPaymentPayout" DROP CONSTRAINT "AppointmentPaymentPayout_payoutRequestId_fkey";

-- Drop indexes related to PayoutRequest
DROP INDEX "AppointmentPaymentPayout_appointmentPaymentId_payoutRequest_key";
DROP INDEX "AppointmentPaymentPayout_payoutRequestId_idx";

-- Alter AppointmentPaymentPayout to remove payoutRequestId
ALTER TABLE "AppointmentPaymentPayout" DROP COLUMN "payoutRequestId";

-- Drop the PayoutRequest table BEFORE handling Enums (to remove dependency on PayoutStatus)
DROP TABLE "PayoutRequest";

-- Handle Enum changes
-- 1. Create new Enum
CREATE TYPE "PayoutStatus_new" AS ENUM ('INITIATED', 'PROCESSING', 'PAID', 'FAILED');

-- 2. Rename old Enum (it is now unused as PayoutRequest is dropped)
ALTER TYPE "PayoutStatus" RENAME TO "PayoutStatus_old";

-- 3. Rename new Enum to correct name
ALTER TYPE "PayoutStatus_new" RENAME TO "PayoutStatus";

-- 4. Drop old Enum
DROP TYPE "PayoutStatus_old";

-- Add payoutId column to AppointmentPaymentPayout
ALTER TABLE "AppointmentPaymentPayout" ADD COLUMN "payoutId" TEXT NOT NULL;

-- Create the new Payout table
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "amountInCents" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'INITIATED',
    "initiatedByAdminId" TEXT NOT NULL,
    "paidAt" TIMESTAMP(3),
    "transactionRef" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payout_pkey" PRIMARY KEY ("id")
);

-- Create Indexes for Payout
CREATE INDEX "Payout_doctorId_idx" ON "Payout"("doctorId");
CREATE INDEX "Payout_status_idx" ON "Payout"("status");
CREATE INDEX "Payout_initiatedByAdminId_idx" ON "Payout"("initiatedByAdminId");

-- Create Indexes for AppointmentPaymentPayout
CREATE INDEX "AppointmentPaymentPayout_payoutId_idx" ON "AppointmentPaymentPayout"("payoutId");
CREATE UNIQUE INDEX "AppointmentPaymentPayout_appointmentPaymentId_payoutId_key" ON "AppointmentPaymentPayout"("appointmentPaymentId", "payoutId");

-- Add Foreign Keys
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "ProfessionalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Payout" ADD CONSTRAINT "Payout_initiatedByAdminId_fkey" FOREIGN KEY ("initiatedByAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AppointmentPaymentPayout" ADD CONSTRAINT "AppointmentPaymentPayout_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
