-- AlterTable
ALTER TABLE "Opportunity" ADD COLUMN     "contractValue" TEXT,
ADD COLUMN     "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sourceName" TEXT;
