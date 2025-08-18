/*
  Warnings:

  - A unique constraint covering the columns `[reference_id]` on the table `pagamentos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_reference_id_key" ON "pagamentos"("reference_id");
