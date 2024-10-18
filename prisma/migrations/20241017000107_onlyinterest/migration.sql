-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "only_pay_interest" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "value_interest_paid" DOUBLE PRECISION NOT NULL DEFAULT 0;
