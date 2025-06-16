/*
  Warnings:

  - You are about to drop the column `dependente` on the `Pessoa` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Pessoa" DROP COLUMN "dependente",
ADD COLUMN     "dependenteDeId" TEXT,
ADD COLUMN     "fotoBase64" TEXT,
ALTER COLUMN "cpf" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Pessoa" ADD CONSTRAINT "Pessoa_dependenteDeId_fkey" FOREIGN KEY ("dependenteDeId") REFERENCES "Pessoa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
