/*
  Warnings:

  - You are about to drop the column `experienceYears` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageUrl` on the `Employee` table. All the data in the column will be lost.
  - You are about to drop the column `skillsets` on the `Employee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Employee` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "experienceYears",
DROP COLUMN "profileImageUrl",
DROP COLUMN "skillsets",
ADD COLUMN     "experience" INTEGER,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "skills" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL,
ALTER COLUMN "education" SET DATA TYPE TEXT,
ALTER COLUMN "certifications" DROP NOT NULL,
ALTER COLUMN "certifications" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Employee_slug_key" ON "Employee"("slug");
