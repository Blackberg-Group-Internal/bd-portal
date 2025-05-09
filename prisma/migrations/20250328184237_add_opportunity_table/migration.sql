-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "OpportunityStage" AS ENUM ('CAPTURE', 'PROPOSAL', 'SUBMITTED', 'WON', 'LOST', 'NO_BID');

-- CreateEnum
CREATE TYPE "OpportunityStatus" AS ENUM ('NOT_STARTED', 'WORKING_ON_IT', 'SUPPORT_NEEDED', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "OpportunityBranch" AS ENUM ('LOCAL', 'STATE', 'INTERNATIONAL', 'FEDERAL', 'COMMERCIAL', 'NONPROFIT');

-- CreateEnum
CREATE TYPE "Department" AS ENUM ('COMMUNICATIONS', 'CREATIVE', 'EVENTS', 'WEB', 'PROJECT_MANAGEMENT');

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "filename" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "documentLink" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "naics" TEXT,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "slug" TEXT NOT NULL,
    "contactEmail" TEXT,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "issuingOrganization" TEXT,
    "matchScore" INTEGER,
    "requirements" TEXT,
    "state" TEXT,
    "title" TEXT NOT NULL DEFAULT '',
    "tags" TEXT[],
    "reviewStatus" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT[],
    "reviewedAt" TIMESTAMP(3),
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "lead" TEXT[],
    "support" TEXT[],
    "reviewer" TEXT[],
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "questionsDue" TIMESTAMP(3),
    "stage" "OpportunityStage" NOT NULL DEFAULT 'CAPTURE',
    "status" "OpportunityStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "note" TEXT,
    "sourceLink" TEXT,
    "branch" "OpportunityBranch" NOT NULL DEFAULT 'FEDERAL',
    "notary" BOOLEAN NOT NULL DEFAULT false,
    "awardDate" TIMESTAMP(3),
    "department" "Department"[],

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Opportunity_slug_key" ON "Opportunity"("slug");
