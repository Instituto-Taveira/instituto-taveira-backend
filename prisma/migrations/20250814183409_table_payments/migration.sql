-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PAID', 'ACTIVE', 'CANCELLED', 'REFUNDED');

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "status" "Status" NOT NULL,
    "checkoutId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentUrl" TEXT NOT NULL,
    "endedAt" TIMESTAMP(3),
    "payer" TEXT,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);
