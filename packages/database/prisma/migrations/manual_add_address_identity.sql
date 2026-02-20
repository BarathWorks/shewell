-- Manual Migration: Add ProfessionalAddress and ProfessionalIdentity tables
-- Run this SQL directly on your database

-- Create ProfessionalAddress table
CREATE TABLE IF NOT EXISTS "ProfessionalAddress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "professionalUserId" TEXT NOT NULL UNIQUE,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "completeAddress" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "ProfessionalAddress_professionalUserId_fkey" FOREIGN KEY ("professionalUserId") REFERENCES "ProfessionalUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create ProfessionalIdentity table
CREATE TABLE IF NOT EXISTS "ProfessionalIdentity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "professionalUserId" TEXT NOT NULL UNIQUE,
    "panNumber" TEXT,
    "aadhaarNumber" TEXT,
    "licenseNumber" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "ProfessionalIdentity_professionalUserId_fkey" FOREIGN KEY ("professionalUserId") REFERENCES "ProfessionalUser" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Add collegeName and completionDate to ProfessionalDegree
ALTER TABLE "ProfessionalDegree" 
ADD COLUMN IF NOT EXISTS "collegeName" TEXT,
ADD COLUMN IF NOT EXISTS "completionDate" TIMESTAMP(3);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "ProfessionalAddress_professionalUserId_idx" ON "ProfessionalAddress"("professionalUserId");
CREATE INDEX IF NOT EXISTS "ProfessionalIdentity_professionalUserId_idx" ON "ProfessionalIdentity"("professionalUserId");
