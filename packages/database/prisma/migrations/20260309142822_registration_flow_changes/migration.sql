/*
  Warnings:

  - Made the column `userName` on table `ProfessionalUser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ProfessionalUser" ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "userName" SET NOT NULL,
ALTER COLUMN "dob" DROP NOT NULL;
