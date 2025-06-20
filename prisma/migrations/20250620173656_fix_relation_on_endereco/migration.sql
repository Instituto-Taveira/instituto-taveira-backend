/*
  Warnings:

  - You are about to drop the column `enderecoId` on the `dependentes` table. All the data in the column will be lost.
  - You are about to drop the column `enderecoId` on the `titulares` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[titularId]` on the table `enderecos` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[dependenteId]` on the table `enderecos` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "dependentes" DROP CONSTRAINT "dependentes_enderecoId_fkey";

-- DropForeignKey
ALTER TABLE "titulares" DROP CONSTRAINT "titulares_enderecoId_fkey";

-- AlterTable
ALTER TABLE "dependentes" DROP COLUMN "enderecoId",
ALTER COLUMN "titularId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "enderecos" ADD COLUMN     "dependenteId" INTEGER,
ADD COLUMN     "titularId" INTEGER;

-- AlterTable
ALTER TABLE "titulares" DROP COLUMN "enderecoId";

-- CreateIndex
CREATE UNIQUE INDEX "enderecos_titularId_key" ON "enderecos"("titularId");

-- CreateIndex
CREATE UNIQUE INDEX "enderecos_dependenteId_key" ON "enderecos"("dependenteId");

-- AddForeignKey
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_titularId_fkey" FOREIGN KEY ("titularId") REFERENCES "titulares"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_dependenteId_fkey" FOREIGN KEY ("dependenteId") REFERENCES "dependentes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
