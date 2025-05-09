/*
  Warnings:

  - Added the required column `processed` to the `Opportunity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "processed" BOOLEAN NOT NULL,
ADD COLUMN     "rfpNumber" TEXT,
ADD COLUMN     "sourceId" TEXT;
