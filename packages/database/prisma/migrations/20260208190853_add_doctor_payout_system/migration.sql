-- CreateEnum
CREATE TYPE "DoctorPaymentStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'PAID');

-- CreateTable
CREATE TABLE "AppointmentPayment" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "totalAmountInCents" INTEGER NOT NULL,
    "doctorShareInCents" INTEGER NOT NULL,
    "platformShareInCents" INTEGER NOT NULL,
    "paymentStatus" "DoctorPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayoutRequest" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "requestedAmountInCents" INTEGER NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayoutRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentPaymentPayout" (
    "id" TEXT NOT NULL,
    "appointmentPaymentId" TEXT NOT NULL,
    "payoutRequestId" TEXT NOT NULL,
    "amountUsedInCents" INTEGER NOT NULL,

    CONSTRAINT "AppointmentPaymentPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentPayment_appointmentId_key" ON "AppointmentPayment"("appointmentId");

-- CreateIndex
CREATE INDEX "AppointmentPayment_doctorId_idx" ON "AppointmentPayment"("doctorId");

-- CreateIndex
CREATE INDEX "AppointmentPayment_paymentStatus_idx" ON "AppointmentPayment"("paymentStatus");

-- CreateIndex
CREATE INDEX "PayoutRequest_doctorId_idx" ON "PayoutRequest"("doctorId");

-- CreateIndex
CREATE INDEX "PayoutRequest_status_idx" ON "PayoutRequest"("status");

-- CreateIndex
CREATE INDEX "AppointmentPaymentPayout_payoutRequestId_idx" ON "AppointmentPaymentPayout"("payoutRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "AppointmentPaymentPayout_appointmentPaymentId_payoutRequest_key" ON "AppointmentPaymentPayout"("appointmentPaymentId", "payoutRequestId");

-- AddForeignKey
ALTER TABLE "AppointmentPayment" ADD CONSTRAINT "AppointmentPayment_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "BookAppointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentPaymentPayout" ADD CONSTRAINT "AppointmentPaymentPayout_appointmentPaymentId_fkey" FOREIGN KEY ("appointmentPaymentId") REFERENCES "AppointmentPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppointmentPaymentPayout" ADD CONSTRAINT "AppointmentPaymentPayout_payoutRequestId_fkey" FOREIGN KEY ("payoutRequestId") REFERENCES "PayoutRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
