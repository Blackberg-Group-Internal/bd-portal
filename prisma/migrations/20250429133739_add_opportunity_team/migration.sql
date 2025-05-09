-- CreateTable
CREATE TABLE "OpportunityTeam" (
    "id" SERIAL NOT NULL,
    "opportunityId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityTeam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpportunityTeam_opportunityId_employeeId_key" ON "OpportunityTeam"("opportunityId", "employeeId");

-- AddForeignKey
ALTER TABLE "OpportunityTeam" ADD CONSTRAINT "OpportunityTeam_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityTeam" ADD CONSTRAINT "OpportunityTeam_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
