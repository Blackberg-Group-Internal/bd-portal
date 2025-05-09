-- CreateTable
CREATE TABLE "OpportunityMessage" (
    "id" SERIAL NOT NULL,
    "opportunityId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpportunityMessage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OpportunityMessage" ADD CONSTRAINT "OpportunityMessage_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "Opportunity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpportunityMessage" ADD CONSTRAINT "OpportunityMessage_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
