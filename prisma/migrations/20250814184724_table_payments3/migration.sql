/*
  Warnings:

  - A unique constraint covering the columns `[checkoutId]` on the table `pagamentos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_checkoutId_key" ON "pagamentos"("checkoutId");
