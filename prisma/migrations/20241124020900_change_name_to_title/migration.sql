/*
  Warnings:

  - You are about to drop the column `name` on the `RfpSummarizerRecord` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "RfpSummarizerRecord" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '';
