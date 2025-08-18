-- CreateTable
CREATE TABLE "Cobranca" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "period" TEXT NOT NULL,
    "billingDate" TIMESTAMP(3),
    "paymentId" INTEGER NOT NULL,

    CONSTRAINT "Cobranca_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cobranca" ADD CONSTRAINT "Cobranca_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "pagamentos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
