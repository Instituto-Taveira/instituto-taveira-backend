/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `modalidades` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "modalidades_nome_key" ON "modalidades"("nome");
