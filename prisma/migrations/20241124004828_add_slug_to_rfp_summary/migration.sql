/*
  Warnings:

  - You are about to drop the column `fileId` on the `RfpSummarizerRecord` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `RfpSummarizerRecord` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `RfpSummarizerRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RfpSummarizerRecord" DROP COLUMN "fileId",
ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "RfpSummarizerRecord_slug_key" ON "RfpSummarizerRecord"("slug");
