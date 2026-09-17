-- AlterTable
ALTER TABLE "pagamentos" ADD COLUMN     "paidManually" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidManuallyAt" TIMESTAMP(3),
ADD COLUMN     "paidManuallyBy" TEXT;
