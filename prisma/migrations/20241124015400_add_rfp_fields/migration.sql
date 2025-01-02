/*
  Warnings:

  - You are about to drop the column `matchRating` on the `RfpSummarizerRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RfpSummarizerRecord" DROP COLUMN "matchRating",
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "issuingOrganization" TEXT,
ADD COLUMN     "matchScore" INTEGER,
ADD COLUMN     "requirements" TEXT,
ADD COLUMN     "state" TEXT;
