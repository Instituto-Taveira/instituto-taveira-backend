/*
  Warnings:

  - The primary key for the `Pessoa` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dependenteDeId` on the `Pessoa` table. All the data in the column will be lost.
  - The `id` column on the `Pessoa` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Role` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `roleId` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `Role` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Pessoa" DROP CONSTRAINT "Pessoa_dependenteDeId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_roleId_fkey";

-- DropIndex
DROP INDEX "User_id_key";

-- AlterTable
ALTER TABLE "Pessoa" DROP CONSTRAINT "Pessoa_pkey",
DROP COLUMN "dependenteDeId",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Role" DROP CONSTRAINT "Role_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" INTEGER NOT NULL,
ADD CONSTRAINT "Role_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "roleId",
ADD COLUMN     "roleId" INTEGER,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Dependente" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "cpf" TEXT,
    "rg" TEXT,
    "tituloEleitor" TEXT,
    "localVotacao" TEXT,
    "cartaoSUS" TEXT,
    "numeroContato" TEXT,
    "whatsapp" TEXT,
    "fotoBase64" TEXT,
    "pessoaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dependente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dependente_cpf_key" ON "Dependente"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Role_id_key" ON "Role"("id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependente" ADD CONSTRAINT "Dependente_pessoaId_fkey" FOREIGN KEY ("pessoaId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
