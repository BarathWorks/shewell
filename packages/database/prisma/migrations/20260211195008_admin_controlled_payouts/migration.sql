/*
  Warnings:

  - The values [REQUESTED,APPROVED,REJECTED] on the enum `PayoutStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `payoutRequestId` on the `AppointmentPaymentPayout` table. All the data in the column will be lost.
  - You are about to drop the `PayoutRequest` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[appointmentPaymentId,payoutId]` on the table `AppointmentPaymentPayout` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payoutId` to the `AppointmentPaymentPayout` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PayoutStatus_new" AS ENUM ('INITIATED', 'PROCESSING', 'PAID', 'FAILED');
ALTER TABLE "PayoutRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payout" ALTER COLUMN "status" TYPE "PayoutStatus_new" USING ("status"::text::"PayoutStatus_new");
ALTER TYPE "PayoutStatus" RENAME TO "PayoutStatus_old";
ALTER TYPE "PayoutStatus_new" RENAME TO "PayoutStatus";
DROP TYPE "PayoutStatus_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "AppointmentPaymentPayout" DROP CONSTRAINT "AppointmentPaymentPayout_payoutRequestId_fkey";

-- DropIndex
DROP INDEX "AppointmentPaymentPayout_appointmentPaymentId_payoutRequest_key";

-- DropIndex
DROP INDEX "AppointmentPaymentPayout_payoutRequestId_idx";

-- AlterTable
ALTER TABLE "AppointmentPaymentPayout" DROP COLUMN "payoutRequestId",
ADD COLUMN     "payoutId" TEXT NOT NULL;

-- DropTable
DROP TABLE "PayoutRequest";

-- CreateTable
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

-- CreateIndex
CREATE INDEX "Payout_doctorId_idx" ON "Payout"("doctorId");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "Payout_initiatedByAdminId_idx" ON "Payout"("initiatedByAdminId");

-- CreateIndex
CREATE INDEX "AppointmentPaymentPayout_payoutId_idx" ON "AppointmentPaymentPayout"("payoutId");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentPaymentPayout_appointmentPaymentId_payoutId_key" ON "AppointmentPaymentPayout"("appointmentPaymentId", "payoutId");

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "ProfessionalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payout" ADD CONSTRAINT "Payout_initiatedByAdminId_fkey" FOREIGN KEY ("initiatedByAdminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentPaymentPayout" ADD CONSTRAINT "AppointmentPaymentPayout_payoutId_fkey" FOREIGN KEY ("payoutId") REFERENCES "Payout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
