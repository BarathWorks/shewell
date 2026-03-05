-- AlterTable
ALTER TABLE "ProfessionalDegree" ADD COLUMN     "collegeName" TEXT,
ADD COLUMN     "completionDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ProfessionalAddress" (
    "id" TEXT NOT NULL,
    "professionalUserId" TEXT NOT NULL,
    "countryId" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "completeAddress" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProfessionalAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionalIdentity" (
    "id" TEXT NOT NULL,
    "professionalUserId" TEXT NOT NULL,
    "panNumber" TEXT,
    "aadhaarNumber" TEXT,
    "licenseNumber" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProfessionalIdentity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalAddress_professionalUserId_key" ON "ProfessionalAddress"("professionalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalIdentity_professionalUserId_key" ON "ProfessionalIdentity"("professionalUserId");

-- AddForeignKey
ALTER TABLE "ProfessionalAddress" ADD CONSTRAINT "ProfessionalAddress_professionalUserId_fkey" FOREIGN KEY ("professionalUserId") REFERENCES "ProfessionalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalAddress" ADD CONSTRAINT "ProfessionalAddress_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalAddress" ADD CONSTRAINT "ProfessionalAddress_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "State"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionalIdentity" ADD CONSTRAINT "ProfessionalIdentity_professionalUserId_fkey" FOREIGN KEY ("professionalUserId") REFERENCES "ProfessionalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
