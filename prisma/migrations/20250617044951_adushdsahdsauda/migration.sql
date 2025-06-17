/*
  Warnings:

  - You are about to drop the column `foto` on the `Dependente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Dependente" DROP COLUMN "foto",
ADD COLUMN     "fotoBase64" TEXT;
