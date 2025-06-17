/*
  Warnings:

  - You are about to drop the column `fotoBase64` on the `Dependente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Dependente" DROP COLUMN "fotoBase64",
ADD COLUMN     "fotoBase64dep" TEXT;
