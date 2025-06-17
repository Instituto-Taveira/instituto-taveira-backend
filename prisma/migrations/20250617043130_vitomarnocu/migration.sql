/*
  Warnings:

  - You are about to drop the column `fotoBase64dep` on the `Dependente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Dependente" DROP COLUMN "fotoBase64dep",
ADD COLUMN     "fotoBase64" TEXT;
