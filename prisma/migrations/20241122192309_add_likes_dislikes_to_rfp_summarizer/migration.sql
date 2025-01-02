-- CreateTable
CREATE TABLE "RfpSummarizerRecord" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "filename" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "assistantId" TEXT NOT NULL,
    "documentLink" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "naics" TEXT,
    "matchRating" INTEGER,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RfpSummarizerRecord_pkey" PRIMARY KEY ("id")
);
