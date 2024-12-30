-- CreateTable
CREATE TABLE "NAICSCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NAICSCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SINCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SINCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NAICSCode_code_key" ON "NAICSCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SINCode_code_key" ON "SINCode"("code");
