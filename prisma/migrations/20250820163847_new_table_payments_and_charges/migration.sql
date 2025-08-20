/*
  Warnings:

  - You are about to drop the `Cobranca` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Cobranca" DROP CONSTRAINT "Cobranca_paymentId_fkey";

-- DropTable
DROP TABLE "Cobranca";

-- CreateTable
CREATE TABLE "cobrancas" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "period" TEXT NOT NULL,
    "billingDate" TIMESTAMP(3),
    "paymentId" INTEGER NOT NULL,

    CONSTRAINT "cobrancas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cobrancas" ADD CONSTRAINT "cobrancas_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "pagamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
