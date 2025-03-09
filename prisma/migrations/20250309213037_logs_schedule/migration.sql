-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "loanIds" TEXT NOT NULL DEFAULT E'[]',
ADD COLUMN     "paymentIds" TEXT NOT NULL DEFAULT E'[]';
