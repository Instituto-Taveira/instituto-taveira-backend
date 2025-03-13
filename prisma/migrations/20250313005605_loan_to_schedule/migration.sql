/*
  Warnings:

  - You are about to drop the column `loan_to_settle` on the `Schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "scheduleId" TEXT;

-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "loan_to_settle";

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
